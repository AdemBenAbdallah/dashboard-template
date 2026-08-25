import { isAxiosError } from "axios"
import { z } from "zod"

/** The error envelope every mock handler (and, later, the real API) returns. */
const apiErrorSchema = z.object({
  message: z.string(),
})

/**
 * Turns an unknown thrown value into a message worth showing a user.
 *
 * Prefers the server's own `message`, falls back to a status-specific line,
 * then to the caller's default. Never surfaces a raw stack trace.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const parsed = apiErrorSchema.safeParse(error.response?.data)
    if (parsed.success) return parsed.data.message

    if (error.response?.status === 403) {
      return "You don't have permission to do that."
    }
    if (error.response?.status === 404) {
      return "That resource no longer exists."
    }
    if (!error.response) {
      return "Could not reach the server. Check your connection."
    }
  }

  return fallback
}
