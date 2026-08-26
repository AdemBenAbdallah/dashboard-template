import type { LinkProps } from "@tanstack/react-router"
import { hasRole, ROLES, type Role } from "@/features/auth/roles"

/**
 * The Users section is split into role segments, each its own route and table.
 *
 * This file is the single source of truth for that split: the sidebar submenu,
 * the route guards, the API layer and the tests all read from it, so the
 * permission matrix is stated exactly once. Adding a segment here wires it
 * everywhere except its route file.
 */

/** Roles that may administer everything. */
const FULL_ACCESS = [ROLES.SUPERADMIN, ROLES.ADMIN_DEVELOPER] as const

/**
 * Where a segment's rows come from.
 *
 * `users` hits `GET /users?role=…`; the other two hit their own endpoints,
 * which return wrapper rows carrying profile data the plain user list lacks.
 */
export type SegmentSource =
  | { kind: "users"; roles: readonly Role[] }
  | { kind: "customers" }
  | { kind: "professionals" }

export interface UserSegment {
  id: string
  to: LinkProps["to"]
  /** Translation key, not display text. */
  titleKey: string
  /** Roles allowed to view this segment. Drives the nav filter and the guard. */
  viewers: readonly Role[]
  source: SegmentSource
}

export const USER_SEGMENTS = [
  {
    id: "super-admins",
    to: "/users/super-admins",
    titleKey: "users.segments.superAdmins",
    viewers: FULL_ACCESS,
    // One table for both: an admin developer is a super admin in all but name.
    source: { kind: "users", roles: [ROLES.SUPERADMIN, ROLES.ADMIN_DEVELOPER] },
  },
  {
    id: "admins",
    to: "/users/admins",
    titleKey: "users.segments.admins",
    viewers: FULL_ACCESS,
    source: { kind: "users", roles: [ROLES.ADMIN] },
  },
  {
    id: "staff",
    to: "/users/staff",
    titleKey: "users.segments.staff",
    viewers: [...FULL_ACCESS, ROLES.ADMIN],
    source: { kind: "users", roles: [ROLES.STAFF] },
  },
  {
    id: "customers",
    to: "/users/customers",
    titleKey: "users.segments.customers",
    viewers: [...FULL_ACCESS, ROLES.ADMIN, ROLES.STAFF],
    source: { kind: "customers" },
  },
  {
    id: "professionals",
    to: "/users/professionals",
    titleKey: "users.segments.professionals",
    viewers: [...FULL_ACCESS, ROLES.ADMIN, ROLES.STAFF],
    source: { kind: "professionals" },
  },
] as const satisfies readonly UserSegment[]

export type UserSegmentId = (typeof USER_SEGMENTS)[number]["id"]

export function findSegment(id: UserSegmentId): UserSegment {
  const segment = USER_SEGMENTS.find((candidate) => candidate.id === id)
  if (!segment) throw new Error(`Unknown user segment: ${id}`)
  return segment
}

/** The segments a role may view, in declaration order. */
export function visibleSegments(
  role: Role | null | undefined,
): readonly UserSegment[] {
  return USER_SEGMENTS.filter((segment) => hasRole(role, segment.viewers))
}

/**
 * Every role that may reach the Users section at all — the union of the
 * segments' viewers. `HR` is deliberately absent: it can sign in but has no
 * business in this section, and falls out of the matrix rather than needing a
 * special case.
 */
export const USERS_SECTION_ROLES: readonly Role[] = [
  ...new Set(USER_SEGMENTS.flatMap((segment) => segment.viewers)),
]
