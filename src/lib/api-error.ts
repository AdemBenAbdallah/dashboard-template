import { isAxiosError } from "axios"
import { z } from "zod"

/**
 * The Nest error envelope. `message` is a string for most exceptions and a
 * string array when the global `ValidationPipe` rejects a body.
 */
const apiErrorSchema = z.object({
  message: z.union([z.string(), z.array(z.string()).nonempty()]),
})

/**
 * The backend answers with stable error *codes*, not prose — the keys in
 * `src/common/exception/exception.messages.ts`. Anything not listed here is
 * shown as-is, which is right for the messages that are already sentences.
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: "Incorrect email or password.",
  account_pending_approval:
    "This account is still awaiting approval by an administrator.",
  account_blocked: "This account has been blocked. Contact an administrator.",
  account_phone_not_verified:
    "Verify the phone number on this account before signing in.",
  account_contact_not_verified:
    "Verify the email address on this account before signing in.",
  verification_token_invalid:
    "That verification link is invalid or has expired.",
}

/**
 * Turns an unknown thrown value into a message worth showing a user.
 *
 * Prefers the server's own `message`, falls back to a status-specific line,
 * then to the caller's default. Never surfaces a raw stack trace.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const parsed = apiErrorSchema.safeParse(error.response?.data)
    if (parsed.success) {
      const raw = Array.isArray(parsed.data.message)
        ? parsed.data.message[0]
        : parsed.data.message
      return ERROR_CODE_MESSAGES[raw] ?? raw
    }

    // The sign-in route is throttled at 10 requests / 30s.
    if (error.response?.status === 429) {
      return "Too many attempts. Wait a moment and try again."
    }
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
