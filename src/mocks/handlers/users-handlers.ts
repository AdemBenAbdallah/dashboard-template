import { HttpResponse, http } from "msw"
import { ROLES, type Role } from "@/features/auth/roles"
import {
  accounts,
  customers,
  professionals,
  removeAccount,
  removeProfile,
  resolveCaller,
  type SeedAccount,
  type SeedProfile,
  setAccountStatus,
  toPublicUser,
  withUser,
} from "../db"
import { API_URL, delay, forbidden, notFound, unauthorized } from "./shared"

/**
 * These handlers stand in for real server-side authorisation, and mirror the
 * live backend's shape exactly: a `{data, total, currentPage}` envelope, a
 * **0-based** `page`, `limit` rather than `pageSize`, and a repeat-format
 * `role` param.
 *
 * They also reproduce the backend's current 403s for STAFF (see the Users
 * section notes in README.md) so the tests show that gap rather than hiding it.
 */

/** `@AdminOnly()` on the backend — ADMIN, SUPERADMIN, ADMIN_DEVELOPER. */
const ADMIN_ROLES: readonly Role[] = [
  ROLES.ADMIN,
  ROLES.SUPERADMIN,
  ROLES.ADMIN_DEVELOPER,
]

function isAdmin(caller: SeedAccount): boolean {
  return ADMIN_ROLES.includes(caller.role)
}

interface PageQuery {
  page: number
  limit: number
  search: string
  roles: string[]
}

function readQuery(url: URL): PageQuery {
  return {
    page: Number.parseInt(url.searchParams.get("page") ?? "0", 10) || 0,
    limit: Number.parseInt(url.searchParams.get("limit") ?? "10", 10) || 10,
    search: (url.searchParams.get("search") ?? "").trim().toLowerCase(),
    // Repeat format: `?role=A&role=B`. The bracketed form lands under a
    // different key and is ignored here exactly as the real server ignores it.
    roles: url.searchParams.getAll("role"),
  }
}

function paginate<T>(rows: readonly T[], { page, limit }: PageQuery) {
  const start = page * limit
  return {
    data: rows.slice(start, start + limit),
    total: rows.length,
    currentPage: page,
  }
}

function matchesSearch(account: SeedAccount, search: string): boolean {
  if (!search) return true
  return [
    account.firstName,
    account.lastName,
    account.email,
    account.phone,
  ].some((field) => field.toLowerCase().includes(search))
}

/** Profile lists join to the account, so search runs against the nested user. */
function profileRows(collection: readonly SeedProfile[], query: PageQuery) {
  const joined = collection
    .map(withUser)
    .filter(
      (row): row is NonNullable<ReturnType<typeof withUser>> => row !== null,
    )
    .filter((row) => {
      if (!query.search) return true
      const account = accounts.find((a) => a.pubkey === row.user.pubkey)
      return account ? matchesSearch(account, query.search) : false
    })

  const page = paginate(joined, query)
  // The profile endpoints echo `limit`; `/users` does not.
  return { ...page, limit: query.limit }
}

export const usersHandlers = [
  http.get(`${API_URL}/users`, async ({ request }) => {
    await delay()
    const caller = resolveCaller(request.headers.get("Authorization"))
    if (!caller) return unauthorized()
    // The real route is CASL-gated on `manage User`, which only the admin
    // roles carry. STAFF has `create User` and is refused.
    if (!isAdmin(caller)) return forbidden()

    const query = readQuery(new URL(request.url))
    const rows = accounts
      .filter((account) =>
        query.roles.length ? query.roles.includes(account.role) : true,
      )
      .filter((account) => matchesSearch(account, query.search))
      .map(toPublicUser)

    return HttpResponse.json(paginate(rows, query))
  }),

  http.delete(`${API_URL}/users/:pubkey`, async ({ request, params }) => {
    await delay()
    const caller = resolveCaller(request.headers.get("Authorization"))
    if (!caller) return unauthorized()
    if (!isAdmin(caller)) return forbidden()

    const pubkey = String(params.pubkey)
    if (pubkey === caller.pubkey) {
      return HttpResponse.json(
        { message: "You cannot delete your own account." },
        { status: 409 },
      )
    }
    if (!removeAccount(pubkey)) return notFound("That user no longer exists.")

    return HttpResponse.json({ message: "User deleted successfully" })
  }),

  http.get(`${API_URL}/customers`, async ({ request }) => {
    await delay()
    const caller = resolveCaller(request.headers.get("Authorization"))
    if (!caller) return unauthorized()
    if (!isAdmin(caller)) return forbidden()

    return HttpResponse.json(
      profileRows(customers, readQuery(new URL(request.url))),
    )
  }),

  http.delete(`${API_URL}/customers/:pubkey`, async ({ request, params }) => {
    await delay()
    const caller = resolveCaller(request.headers.get("Authorization"))
    if (!caller) return unauthorized()
    if (!isAdmin(caller)) return forbidden()

    if (!removeProfile(customers, String(params.pubkey))) {
      return notFound("That customer no longer exists.")
    }
    return HttpResponse.json({ message: "Customer deleted successfully" })
  }),

  http.get(`${API_URL}/professionals`, async ({ request }) => {
    await delay()
    const caller = resolveCaller(request.headers.get("Authorization"))
    if (!caller) return unauthorized()
    if (!isAdmin(caller)) return forbidden()

    return HttpResponse.json(
      profileRows(professionals, readQuery(new URL(request.url))),
    )
  }),

  http.patch(
    `${API_URL}/professionals/:pubkey/approve`,
    async ({ request, params }) => {
      await delay(150)
      const caller = resolveCaller(request.headers.get("Authorization"))
      if (!caller) return unauthorized()
      if (!isAdmin(caller)) return forbidden()

      const row = professionals.find((p) => p.pubkey === String(params.pubkey))
      if (!row) return notFound("That professional no longer exists.")
      // Approval writes the account's status, not a flag on the profile.
      setAccountStatus(row.userPubkey, "ACTIVE")
      return HttpResponse.json(withUser(row))
    },
  ),

  http.patch(
    `${API_URL}/professionals/:pubkey/revoke`,
    async ({ request, params }) => {
      await delay(150)
      const caller = resolveCaller(request.headers.get("Authorization"))
      if (!caller) return unauthorized()
      if (!isAdmin(caller)) return forbidden()

      const row = professionals.find((p) => p.pubkey === String(params.pubkey))
      if (!row) return notFound("That professional no longer exists.")
      setAccountStatus(row.userPubkey, "BLOCKED")
      return HttpResponse.json(withUser(row))
    },
  ),

  http.delete(
    `${API_URL}/professionals/:pubkey`,
    async ({ request, params }) => {
      await delay()
      const caller = resolveCaller(request.headers.get("Authorization"))
      if (!caller) return unauthorized()
      if (!isAdmin(caller)) return forbidden()

      if (!removeProfile(professionals, String(params.pubkey))) {
        return notFound("That professional no longer exists.")
      }
      return HttpResponse.json({ message: "Professional deleted successfully" })
    },
  ),
]
