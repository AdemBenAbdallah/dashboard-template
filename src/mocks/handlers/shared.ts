import { HttpResponse } from "msw"

/**
 * Handlers are registered against the same base URL the app calls, so a
 * relative `VITE_API_URL` like `/api` and an absolute one both match.
 */
export const API_URL = import.meta.env.VITE_API_URL

/**
 * A little latency so loading states are actually visible in development.
 *
 * Skipped under test, where it would only make the suite slow — assertions
 * wait on state, not on the clock.
 */
export function delay(ms = 300): Promise<void> {
  if (import.meta.env.MODE === "test") return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function unauthorized(message = "Not authenticated.") {
  return HttpResponse.json({ message }, { status: 401 })
}

export function forbidden(message = "You don't have permission to do that.") {
  return HttpResponse.json({ message }, { status: 403 })
}

export function notFound(message = "Not found.") {
  return HttpResponse.json({ message }, { status: 404 })
}
