import { describe, expect, it } from "vitest"
import { login } from "@/features/auth/api/auth-api"
import { ROLES } from "@/features/auth/roles"
import { userSchema } from "@/features/auth/schemas"
import { useAuthStore } from "@/features/auth/store"
import { cardPaymentListSchema } from "@/features/card-payments/schemas"
import {
  chartResponseSchema,
  dashboardStatsSchema,
  tableResponseSchema,
} from "@/features/dashboard/schemas"
import { requestListSchema } from "@/features/requests/schemas"
import { serviceListSchema } from "@/features/services/schemas"
import { segmentQueries } from "@/features/users/api/users-api"
import { USER_SEGMENTS } from "@/features/users/segments"
import { apiClient } from "@/lib/api-client"
import { DEFAULT_PAGINATION } from "@/lib/pagination"
import { createTestQueryClient, TEST_CREDENTIALS } from "@/test/utils"

/**
 * Contract layer.
 *
 * Every endpoint's response is parsed with the schema the app uses for it. If
 * someone edits a schema or the mock seed data without the other, this fails —
 * which is the whole point. These are the cheapest tests in the suite and the
 * first line of defence against API drift.
 */
async function asSuperadmin() {
  const session = await login(TEST_CREDENTIALS[ROLES.SUPERADMIN])
  useAuthStore.getState().setSession(session)
}

describe("auth endpoints", () => {
  it("POST /auth/signin matches the session schema", async () => {
    const session = await login(TEST_CREDENTIALS[ROLES.SUPERADMIN])
    expect(session.user.role).toBe(ROLES.SUPERADMIN)
    expect(session.accessToken).toBeTruthy()
    expect(session.refreshToken).toBeTruthy()
  })

  it("never returns the password field", async () => {
    const session = await login(TEST_CREDENTIALS[ROLES.SUPERADMIN])
    expect(session.user).not.toHaveProperty("password")
  })

  it("GET /auth/profile matches the user schema", async () => {
    await asSuperadmin()
    const response = await apiClient.get("/auth/profile")
    expect(() => userSchema.parse(response.data)).not.toThrow()
    expect(response.data).not.toHaveProperty("password")
  })
})

/**
 * The users section speaks the backend's own envelope — `{data, total,
 * currentPage}`, 0-based page, `limit` — rather than the template's, so it is
 * checked through the same adapter the app uses.
 */
describe("users section endpoints", () => {
  it.each(USER_SEGMENTS.map((segment) => segment.id))(
    "the %s segment parses",
    async (segmentId) => {
      await asSuperadmin()
      const page = await createTestQueryClient().fetchQuery(
        segmentQueries.list(segmentId, DEFAULT_PAGINATION, ""),
      )

      expect(Array.isArray(page.rows)).toBe(true)
      // Adapted back to the 1-based paging the UI uses.
      expect(page.page).toBe(1)
      expect(page.total).toBeGreaterThanOrEqual(page.rows.length)
    },
  )

  it("filters by role, and does not leak other roles into a segment", async () => {
    await asSuperadmin()
    const page = await createTestQueryClient().fetchQuery(
      segmentQueries.list("admins", DEFAULT_PAGINATION, ""),
    )
    const roles = page.rows.map((row) => ("role" in row ? row.role : null))

    expect(roles.length).toBeGreaterThan(0)
    expect(new Set(roles)).toEqual(new Set(["ADMIN"]))
  })
})

describe("dashboard endpoints", () => {
  it("GET /dashboard/stats matches its schema", async () => {
    await asSuperadmin()
    const response = await apiClient.get("/dashboard/stats")
    const parsed = dashboardStatsSchema.parse(response.data)
    expect(parsed.cards).toHaveLength(4)
  })

  it.each(["7d", "30d", "90d"])(
    "GET /dashboard/chart?range=%s matches its schema",
    async (range) => {
      await asSuperadmin()
      const response = await apiClient.get("/dashboard/chart", {
        params: { range },
      })
      const parsed = chartResponseSchema.parse(response.data)
      expect(parsed.range).toBe(range)
      expect(parsed.points.length).toBeGreaterThan(0)
    },
  )

  it("GET /dashboard/table matches the paginated envelope", async () => {
    await asSuperadmin()
    const response = await apiClient.get("/dashboard/table", {
      params: { page: 1, pageSize: 10 },
    })
    const parsed = tableResponseSchema.parse(response.data)
    expect(parsed.rows).toHaveLength(10)
    expect(parsed.total).toBeGreaterThan(parsed.rows.length)
  })
})

describe("list endpoints", () => {
  const cases = [
    ["/services", serviceListSchema, "rows"],
    ["/requests", requestListSchema, "rows"],
    ["/card-payments", cardPaymentListSchema, "rows"],
  ] as const

  it.each(cases)("GET %s matches its schema", async (path, schema, key) => {
    await asSuperadmin()
    const response = await apiClient.get(path, {
      params: { page: 1, pageSize: 10 },
    })
    const parsed = schema.parse(response.data) as Record<string, unknown>
    expect(Array.isArray(parsed[key])).toBe(true)
  })
})
