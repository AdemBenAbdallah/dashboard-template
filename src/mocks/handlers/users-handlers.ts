import { HttpResponse, http } from "msw"
import { ROLES } from "@/features/auth/roles"
import { inviteUserSchema } from "@/features/users/schemas"
import {
  accounts,
  addAccount,
  removeAccount,
  resolveCaller,
  toPublicUser,
} from "../db"
import { API_URL, delay, forbidden, notFound, unauthorized } from "./shared"

/**
 * These handlers stand in for real server-side authorisation.
 *
 * Note that every mutation re-checks the caller's role from their token — it
 * does not trust anything the client sends. That is the behaviour the real
 * backend must implement; the route guards and `<Can>` in the UI are only
 * there so users aren't shown buttons that would 403.
 */
export const usersHandlers = [
  http.get(`${API_URL}/users`, async ({ request }) => {
    await delay()
    const caller = resolveCaller(request.headers.get("Authorization"))
    if (!caller) return unauthorized()
    if (caller.role !== ROLES.SUPERADMIN) return forbidden()

    return HttpResponse.json({ users: accounts.map(toPublicUser) })
  }),

  http.post(`${API_URL}/users`, async ({ request }) => {
    await delay()
    const caller = resolveCaller(request.headers.get("Authorization"))
    if (!caller) return unauthorized()
    if (caller.role !== ROLES.SUPERADMIN) return forbidden()

    const parsed = inviteUserSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json(
        { message: "Check the invitation details and try again." },
        { status: 400 },
      )
    }

    const exists = accounts.some(
      (account) =>
        account.email.toLowerCase() === parsed.data.email.toLowerCase(),
    )
    if (exists) {
      return HttpResponse.json(
        { message: "That email already has an account." },
        { status: 409 },
      )
    }

    return HttpResponse.json(toPublicUser(addAccount(parsed.data)), {
      status: 201,
    })
  }),

  http.delete(`${API_URL}/users/:id`, async ({ request, params }) => {
    await delay()
    const caller = resolveCaller(request.headers.get("Authorization"))
    if (!caller) return unauthorized()
    if (caller.role !== ROLES.SUPERADMIN) return forbidden()

    const id = String(params.id)
    if (id === caller.id) {
      return HttpResponse.json(
        { message: "You cannot delete your own account." },
        { status: 409 },
      )
    }

    if (!removeAccount(id)) return notFound("That user no longer exists.")

    return new HttpResponse(null, { status: 204 })
  }),
]
