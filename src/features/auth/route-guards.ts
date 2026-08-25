import { redirect } from "@tanstack/react-router"
import type { RouterContext } from "@/routes/__root"
import { hasRole, type Role } from "./roles"
import type { User } from "./schemas"
import { selectIsAuthenticated } from "./store"

/**
 * ⚠️ EVERYTHING IN THIS FILE IS UX ONLY.
 *
 * Route guards, nav filtering and `<Can>` exist so users are not shown doors
 * they cannot open. They run in the browser, on code the user controls, using
 * a role the user's own client reports. None of it is a security boundary.
 *
 * The backend MUST independently authorise every request — check the caller's
 * role from the verified access token on the server for each endpoint. Assume
 * an attacker calls `DELETE /users/:id` directly with curl; the only thing
 * that stops them is server-side authorisation.
 */

/** Where unauthenticated users are sent, and where they come back to. */
export const LOGIN_ROUTE = "/login" as const

/** Where authenticated users with the wrong role are sent. */
export const FALLBACK_ROUTE = "/dashboard" as const

interface AuthGuardArgs {
  context: RouterContext
  location: { href: string }
}

/**
 * Redirects to `/login` when there is no session, preserving the attempted
 * URL in a `redirect` search param.
 */
export function requireAuthenticated({ context, location }: AuthGuardArgs): {
  user: User
} {
  const state = context.auth.getState()

  if (!selectIsAuthenticated(state) || !state.user) {
    throw redirect({
      to: LOGIN_ROUTE,
      search: { redirect: location.href },
    })
  }

  return { user: state.user }
}

/**
 * Redirects to `/dashboard` when the signed-in user's role is not in
 * `allowed`. Assumes `requireAuthenticated` already ran on a parent route.
 */
export function requireRole(
  context: RouterContext,
  allowed: readonly Role[],
): { allowedRoles: readonly Role[] } {
  const state = context.auth.getState()

  if (!hasRole(state.user?.role, allowed)) {
    throw redirect({ to: FALLBACK_ROUTE })
  }

  return { allowedRoles: allowed }
}
