import type { ReactNode } from "react"
import { useCan } from "../hooks/use-can"
import type { Role } from "../roles"

interface CanProps {
  /** A single role or a list; the user needs any one of them. */
  role: Role | readonly Role[]
  children: ReactNode
  /** Rendered instead of `children` when the check fails. */
  fallback?: ReactNode
}

/**
 * Hides a subtree from users without the role.
 *
 * ```tsx
 * <Can role={ROLES.SUPERADMIN}>
 *   <Button>Invite user</Button>
 * </Can>
 * ```
 *
 * UX only — see the warning in `route-guards.ts`.
 */
export function Can({ role, children, fallback = null }: CanProps): ReactNode {
  return useCan(role) ? children : fallback
}
