import { screen, waitFor } from "@testing-library/react"
import { HttpResponse, http } from "msw"
import { describe, expect, it } from "vitest"
import { bootstrapSession } from "@/features/auth/api/auth-api"
import { ROLES } from "@/features/auth/roles"
import { useAuthStore } from "@/features/auth/store"
import { apiClient } from "@/lib/api-client"
import { tokenStorage } from "@/lib/token-storage"
import { server } from "@/test/server"
import {
  currentPath,
  renderRoute,
  signIn,
  TEST_CREDENTIALS,
} from "@/test/utils"

/** Absolute, and pinned in vitest.config.ts — see the note there. */
const API = import.meta.env.VITE_API_URL

/** Counts requests to a path for the duration of one test. */
function countRequests(method: "GET" | "POST", path: string) {
  const counter = { count: 0 }
  server.events.on("request:start", ({ request }) => {
    if (request.method === method && new URL(request.url).pathname === path) {
      counter.count += 1
    }
  })
  return counter
}

describe("session bootstrap", () => {
  it("restores a session from a stored refresh token", async () => {
    const session = await signIn(ROLES.SUPERADMIN)
    // Simulate a fresh page load: only the persisted refresh token survives.
    useAuthStore.setState({ user: null, accessToken: null, status: "idle" })
    tokenStorage.setRefreshToken(session.refreshToken)

    const restored = await bootstrapSession()

    expect(restored).not.toBeNull()
    expect(restored?.user.email).toBe(TEST_CREDENTIALS[ROLES.SUPERADMIN].email)
    expect(useAuthStore.getState().status).toBe("authenticated")
  })

  it("resolves to null when there is no token, without throwing", async () => {
    await expect(bootstrapSession()).resolves.toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it("clears the session when the stored token is rejected", async () => {
    tokenStorage.setRefreshToken("rt_usr_999_1_1")
    server.use(
      http.post(`${API}/auth/refresh-token`, () =>
        HttpResponse.json({ message: "Session expired." }, { status: 401 }),
      ),
    )

    await expect(bootstrapSession()).resolves.toBeNull()
    expect(useAuthStore.getState().status).toBe("unauthenticated")
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  /**
   * Regression: bootstrap was not single-flight, so React StrictMode's
   * double-invoked effect fired two refreshes — a duplicate refresh plus
   * profile round trip on every page load.
   */
  it("issues exactly one refresh when called concurrently", async () => {
    const session = await signIn(ROLES.STAFF)
    useAuthStore.setState({ user: null, accessToken: null, status: "idle" })
    tokenStorage.setRefreshToken(session.refreshToken)

    const refreshes = countRequests("POST", "/v1/api/auth/refresh-token")

    const [a, b, c] = await Promise.all([
      bootstrapSession(),
      bootstrapSession(),
      bootstrapSession(),
    ])

    expect(refreshes.count).toBe(1)
    expect(a).not.toBeNull()
    // All callers observe the same resolved session, not a torn-down one.
    expect(b).toBe(a)
    expect(c).toBe(a)
    expect(useAuthStore.getState().status).toBe("authenticated")
  })

  /**
   * The backend's `refreshTokenUser` returns `{ access_token }` and nothing
   * else — it does not rotate the refresh token. The client must accept that
   * response and keep the stored refresh token, rather than treating a missing
   * one as a dead session.
   */
  it("keeps the stored refresh token when the refresh does not rotate it", async () => {
    const session = await signIn(ROLES.SUPERADMIN)
    useAuthStore.setState({ user: null, accessToken: null, status: "idle" })
    tokenStorage.setRefreshToken(session.refreshToken)

    const restored = await bootstrapSession()

    expect(restored?.refreshToken).toBe(session.refreshToken)
    expect(tokenStorage.getRefreshToken()).toBe(session.refreshToken)
    // A new access token was issued, so the old one is not simply reused.
    expect(restored?.accessToken).not.toBe(session.accessToken)
    expect(useAuthStore.getState().accessToken).toBe(restored?.accessToken)
  })
})

describe("401 refresh-and-replay", () => {
  /**
   * Regression: concurrent 401s must share one refresh and then all be
   * replayed, rather than each firing its own refresh.
   */
  it("refreshes once for concurrent 401s and replays every request", async () => {
    await signIn(ROLES.SUPERADMIN)
    // Poison the in-memory access token so the next calls 401 once.
    useAuthStore.setState({ accessToken: "at_expired" })

    const refreshes = countRequests("POST", "/v1/api/auth/refresh-token")

    const results = await Promise.all([
      apiClient.get("/dashboard/stats"),
      apiClient.get("/users"),
      apiClient.get("/services", { params: { page: 1, pageSize: 10 } }),
    ])

    expect(refreshes.count).toBe(1)
    for (const response of results) {
      expect(response.status).toBe(200)
    }
  })

  it("gives up and clears the session when the refresh itself fails", async () => {
    await signIn(ROLES.SUPERADMIN)
    useAuthStore.setState({ accessToken: "at_expired" })
    server.use(
      http.post(`${API}/auth/refresh-token`, () =>
        HttpResponse.json({ message: "Session expired." }, { status: 401 }),
      ),
    )

    await expect(apiClient.get("/dashboard/stats")).rejects.toBeDefined()
    await waitFor(() => {
      expect(useAuthStore.getState().status).toBe("unauthenticated")
    })
  })

  it("does not retry a 403 — that is authorization, not authentication", async () => {
    await signIn(ROLES.STAFF)
    const refreshes = countRequests("POST", "/v1/api/auth/refresh-token")

    await expect(apiClient.get("/users")).rejects.toMatchObject({
      response: { status: 403 },
    })
    expect(refreshes.count).toBe(0)
    // The session must survive a mere permission denial.
    expect(useAuthStore.getState().status).toBe("authenticated")
  })
})

describe("no login flash for a restored session", () => {
  it("lands on the requested protected route, not /login", async () => {
    const { router } = await renderRoute("/settings", { as: ROLES.STAFF })
    expect(currentPath(router)).toBe("/settings")
    expect(screen.queryByRole("button", { name: /sign in/i })).toBeNull()
  })
})
