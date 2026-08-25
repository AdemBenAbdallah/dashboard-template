import { FALLBACK_ROUTE } from "./route-guards"

/**
 * Sanitises the `?redirect=` search param used by the login flow.
 *
 * Only plain in-app paths are honoured. Anything absolute, protocol-relative
 * (`//host`), or scheme-bearing (`javascript:`) falls back to the dashboard, so
 * a crafted link cannot turn the login page into an open redirect.
 *
 * Lives in its own module rather than inside the route file so it can be unit
 * tested directly — this is security-relevant behaviour.
 */
export function safeRedirect(target: string | undefined | null): string {
  if (!target) return FALLBACK_ROUTE

  // Must be a rooted path, and must not be protocol-relative.
  if (!target.startsWith("/")) return FALLBACK_ROUTE
  if (target.startsWith("//")) return FALLBACK_ROUTE

  // Backslashes are normalised to slashes by some browsers, so `/\evil.com`
  // can behave like `//evil.com`.
  if (target.startsWith("/\\")) return FALLBACK_ROUTE

  return target
}
