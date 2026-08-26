import { HttpResponse, http } from "msw"
import {
  findAccountByCredentials,
  issueTokens,
  refreshAccessToken,
  resolveCaller,
  revokeTokensFor,
  toProfile,
  toPublicUser,
} from "../db"
import { API_URL, delay, unauthorized } from "./shared"

/**
 * Mirrors the iris-backend `@Controller('api/auth')` routes the dashboard
 * uses. Paths, casing and status codes match the real service — including the
 * parts that are awkward, like a refresh that returns an access token alone.
 */
export const authHandlers = [
  http.post(`${API_URL}/auth/signin`, async ({ request }) => {
    await delay()

    const body = (await request.json().catch(() => ({}))) as {
      username?: string
      password?: string
    }
    if (!body.username || !body.password) {
      // The global ValidationPipe answers with an array of messages.
      return HttpResponse.json(
        { message: ["username should not be empty"] },
        { status: 400 },
      )
    }

    const account = findAccountByCredentials(body.username, body.password)
    if (!account) {
      return HttpResponse.json(
        { message: "invalid_credentials" },
        { status: 401 },
      )
    }
    if (account.status === "INACTIVE") {
      return HttpResponse.json(
        { message: "account_pending_approval" },
        { status: 403 },
      )
    }
    if (account.status === "BLOCKED") {
      return HttpResponse.json({ message: "account_blocked" }, { status: 403 })
    }

    return HttpResponse.json({
      ...issueTokens(account.pubkey),
      user: toPublicUser(account),
    })
  }),

  http.post(`${API_URL}/auth/refresh-token`, async ({ request }) => {
    await delay(150)

    const body = (await request.json().catch(() => ({}))) as {
      refresh_token?: string
    }
    const tokens = body.refresh_token
      ? refreshAccessToken(body.refresh_token)
      : null

    if (!tokens) {
      return unauthorized("Session expired. Please sign in again.")
    }

    // Note: no refresh token in the response. The backend does not rotate.
    return HttpResponse.json(tokens)
  }),

  http.post(`${API_URL}/auth/signout`, async ({ request }) => {
    await delay(100)
    // The backend identifies the session from the bearer token, not a body.
    const caller = resolveCaller(request.headers.get("Authorization"))
    if (!caller) return unauthorized()
    revokeTokensFor(caller.pubkey)
    return HttpResponse.json({ message: "Token invalidated successfully" })
  }),

  http.get(`${API_URL}/auth/profile`, async ({ request }) => {
    await delay(100)
    const caller = resolveCaller(request.headers.get("Authorization"))
    if (!caller) return unauthorized()
    return HttpResponse.json(toProfile(caller))
  }),
]
