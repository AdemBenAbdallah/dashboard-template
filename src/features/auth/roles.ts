/**
 * Roles are declared as a const object so the union type is derived from a
 * single source of truth. Never type a role as a bare `string`.
 *
 * Adding a role: add it here, then widen the nav entries in
 * `src/components/layout/nav-items.ts` and any `roles` on a route's
 * `staticData`. Nothing else needs to change.
 */
export const ROLES = {
  SUPERADMIN: "superadmin",
  PROFICIENT: "proficient",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/** Every role, ordered most privileged first. Useful for `z.enum` and selects. */
export const ROLE_VALUES = Object.values(ROLES) as [Role, ...Role[]]

const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Super admin",
  proficient: "Proficient",
}

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role]
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
