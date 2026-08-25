import { HttpResponse, http } from "msw"
import { ROLES } from "@/features/auth/roles"
import { CARD_PAYMENTS, REQUESTS, SERVICES } from "../data/operations"
import { resolveCaller } from "../db"
import { API_URL, delay, forbidden, unauthorized } from "./shared"

/**
 * Services, requests and card payments are superadmin-only, matching the route
 * guards. As with `/users`, the check here is the one that actually protects
 * the data — the client-side guards only keep users from seeing dead ends.
 */
function paginate<T>(rows: readonly T[], url: string) {
  const params = new URL(url).searchParams
  const page = Math.max(1, Number(params.get("page")) || 1)
  const pageSize = Math.max(1, Number(params.get("pageSize")) || 10)
  const start = (page - 1) * pageSize

  return {
    rows: rows.slice(start, start + pageSize),
    page,
    pageSize,
    total: rows.length,
  }
}

/** Builds a superadmin-gated, paginated GET handler for a static collection. */
function listHandler<T>(path: string, rows: readonly T[]) {
  return http.get(`${API_URL}${path}`, async ({ request }) => {
    await delay()
    const caller = resolveCaller(request.headers.get("Authorization"))
    if (!caller) return unauthorized()
    if (caller.role !== ROLES.SUPERADMIN) return forbidden()

    return HttpResponse.json(paginate(rows, request.url))
  })
}

export const operationsHandlers = [
  listHandler("/services", SERVICES),
  listHandler("/requests", REQUESTS),
  listHandler("/card-payments", CARD_PAYMENTS),
]
