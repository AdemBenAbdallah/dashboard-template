import { hasRole, type Role } from "../roles"
import { useAuthStore } from "../store"

/**
 * Component-level gate. See the warning in `route-guards.ts`: this hides UI,
 * it does not protect data. The server must authorise the action too.
 *
 * ```ts
 * const canManageUsers = useCan(ROLES.SUPERADMIN)
 * ```
 */
export function useCan(role: Role | readonly Role[]): boolean {
  const currentRole = useAuthStore((state) => state.user?.role ?? null)
  const allowed = Array.isArray(role) ? role : [role as Role]
  return hasRole(currentRole, allowed)
}
