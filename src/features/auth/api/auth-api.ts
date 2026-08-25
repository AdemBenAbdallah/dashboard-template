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

export async function login(input: LoginInput): Promise<Session> {
  const response = await apiClient.post("/auth/login", input)
  return sessionSchema.parse(response.data)
}

export async function logout(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken()
  try {
    await apiClient.post("/auth/logout", { refreshToken })
  } catch {
    // A failed logout must still clear the client session.
  }
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get("/auth/me")
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
 * Single-flight, and deliberately cached for the lifetime of the page: refresh
 * tokens rotate, so a second concurrent call would present the token the first
 * call just invalidated, get a 401, and tear down the session the first call
 * had just established. React StrictMode double-invokes effects in
 * development, which makes that race reproducible on every reload.
 */
let bootstrapPromise: Promise<Session | null> | null = null

export function bootstrapSession(): Promise<Session | null> {
  bootstrapPromise ??= runBootstrap()
  return bootstrapPromise
}

async function runBootstrap(): Promise<Session | null> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return null

  const store = useAuthStore.getState()
  store.setStatus("loading")

  try {
    const response = await apiClient.post("/auth/refresh", { refreshToken })
    const tokens = refreshResponseSchema.parse(response.data)

    // Seed the access token so the follow-up /auth/me call is authorised.
    store.setTokens(tokens)

    const user = await fetchCurrentUser()
    const session: Session = { user, ...tokens }
    store.setSession(session)
    return session
  } catch {
    store.clearSession()
    return null
  }
}
