import { apiClient } from "@/lib/api-client"
import { tokenStorage } from "@/lib/token-storage"
import {
  type LoginInput,
  refreshResponseSchema,
  type Session,
  sessionSchema,
  type User,
  userSchema,
} from "../schemas"
import { useAuthStore } from "../store"

/**
 * `POST /auth/signin` is the passport-local endpoint: it takes `username`,
 * not `email`. The form keeps `email` because that is what the user types.
 */
export async function login(input: LoginInput): Promise<Session> {
  const response = await apiClient.post("/auth/signin", {
    username: input.email,
    password: input.password,
  })
  return sessionSchema.parse(response.data)
}

export async function logout(): Promise<void> {
  try {
    // No body: the backend reads the access token off the Authorization
    // header, which the request interceptor has already attached.
    await apiClient.post("/auth/signout")
  } catch {
    // A failed logout must still clear the client session.
  }
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get("/auth/profile")
  return userSchema.parse(response.data)
}

/**
 * Restores a session on a cold page load.
 *
 * Exchanges the persisted refresh token for a fresh access token, then loads
 * the user. Resolves to `null` when there is nothing to restore or the token
 * is no longer valid — callers should treat that as "unauthenticated", not as
 * an error.
 *
 * Single-flight for the lifetime of the page. The backend does not rotate
 * refresh tokens, so a concurrent second call would not invalidate the first,
 * but it would still fire a duplicate refresh + profile round trip on every
 * reload — React StrictMode double-invokes effects in development, which makes
 * that happen on every reload.
 */
let bootstrapPromise: Promise<Session | null> | null = null

export function bootstrapSession(): Promise<Session | null> {
  bootstrapPromise ??= runBootstrap()
  return bootstrapPromise
}

/**
 * Test-only escape hatch. The cached promise is what makes bootstrap
 * single-flight for the lifetime of a page load, which is correct in the
 * browser but means a second test could never re-run it. Never call this from
 * application code.
 */
export function resetSessionBootstrapForTests(): void {
  bootstrapPromise = null
}

async function runBootstrap(): Promise<Session | null> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return null

  const store = useAuthStore.getState()
  store.setStatus("loading")

  try {
    const response = await apiClient.post("/auth/refresh-token", {
      refresh_token: refreshToken,
    })
    const { accessToken } = refreshResponseSchema.parse(response.data)

    // Seed the access token so the follow-up /auth/profile call is authorised.
    store.setTokens({ accessToken })

    const user = await fetchCurrentUser()
    // The refresh token is not re-issued, so the stored one is still current.
    const session: Session = { user, accessToken, refreshToken }
    store.setSession(session)
    return session
  } catch {
    store.clearSession()
    return null
  }
}
