import { i18next } from "@/lib/i18n"

/**
 * Roles are declared as a const object so the union type is derived from a
 * single source of truth. Never type a role as a bare `string`.
 *
 * The values mirror the backend's `RoleEnum` (`prisma/models/user.prisma`)
 * verbatim, including the casing — they arrive on the wire from
 * `/v1/api/auth/signin` and `/v1/api/auth/profile`, and are compared as-is.
 *
 * Adding a role: add it here, then widen the nav entries in
 * `src/components/layout/nav-items.ts` and any `roles` on a route's
 * `staticData`. Nothing else needs to change.
 */
export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN_DEVELOPER: "ADMIN_DEVELOPER",
  ADMIN: "ADMIN",
  HR: "HR",
  STAFF: "STAFF",
  PROFESSIONAL: "PROFESSIONAL",
  CUSTOMER: "CUSTOMER",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/** Every role, ordered most privileged first. Useful for `z.enum` and selects. */
export const ROLE_VALUES = Object.values(ROLES) as [Role, ...Role[]]

/**
 * Roles allowed to use the dashboard at all.
 *
 * `POST /api/auth/signin` authenticates *any* active account, including the
 * mobile-app roles, so login checks membership here before establishing a
 * session. Mirrors `ADMIN_ROLES` in the backend `RolesGuard` plus the internal
 * staff roles.
 */
export const DASHBOARD_ROLES = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN_DEVELOPER,
  ROLES.ADMIN,
  ROLES.HR,
  ROLES.STAFF,
] as const

/**
 * Human-readable role name in the active locale.
 *
 * Labels live in the `auth.roles.<ROLE>` block of each locale file under
 * `src/locales`,
 * keyed by the wire value. Components that render a label inside a subtree
 * which does not otherwise subscribe to i18next should call `useTranslation()`
 * so the label re-renders when the locale changes.
 */
export function roleLabel(role: Role): string {
  return i18next.t(`auth.roles.${role}`)
}

/**
 * Central predicate for "may this role see this thing?".
 *
 * `allowed === undefined` means the resource is not role-restricted.
 */
export function hasRole(
  role: Role | null | undefined,
  allowed?: readonly Role[],
): boolean {
  if (!allowed || allowed.length === 0) return true
  if (!role) return false
  return allowed.includes(role)
}
