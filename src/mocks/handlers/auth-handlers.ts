import { HttpResponse, http } from "msw"
import { loginSchema } from "@/features/auth/schemas"
import {
  findAccountByCredentials,
  issueTokens,
  resolveCaller,
  revokeRefreshToken,
  rotateTokens,
  toPublicUser,
} from "../db"
import { API_URL, delay, unauthorized } from "./shared"

export const authHandlers = [
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    await delay()

    const parsed = loginSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json(
        { message: "Email and password are required." },
        { status: 400 },
      )
    }

    const account = findAccountByCredentials(
      parsed.data.email,
      parsed.data.password,
    )
    if (!account) {
      return HttpResponse.json(
        { message: "Incorrect email or password." },
        { status: 401 },
      )
    }

    return HttpResponse.json({
      user: toPublicUser(account),
      ...issueTokens(account.id),
    })
  }),

  http.post(`${API_URL}/auth/refresh`, async ({ request }) => {
    await delay(150)

    const body = (await request.json()) as { refreshToken?: string }
    const tokens = body.refreshToken ? rotateTokens(body.refreshToken) : null

    if (!tokens) {
      return HttpResponse.json(
        { message: "Session expired. Please sign in again." },
        { status: 401 },
      )
    }

    return HttpResponse.json(tokens)
  }),

  http.post(`${API_URL}/auth/logout`, async ({ request }) => {
    await delay(100)
    const body = (await request.json().catch(() => ({}))) as {
      refreshToken?: string
    }
    revokeRefreshToken(body.refreshToken)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API_URL}/auth/me`, async ({ request }) => {
    await delay(100)
    const caller = resolveCaller(request.headers.get("Authorization"))
    if (!caller) return unauthorized()
    return HttpResponse.json(toPublicUser(caller))
  }),
]
