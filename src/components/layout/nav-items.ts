import type { LinkProps } from "@tanstack/react-router"
import {
  CreditCardIcon,
  InboxIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  Settings2Icon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react"
import { ROLES, type Role } from "@/features/auth/roles"

export interface NavItem {
  /** A translation key, not display text — render it through `t()`. */
  title: string
  /** Typed against the generated route tree — a typo is a compile error. */
  to: LinkProps["to"]
  icon: LucideIcon
  /** Omit to show the item to every signed-in role. */
  roles?: readonly Role[]
}

/**
 * Gating layer 2 of 3: navigation.
 *
 * `AppSidebar` filters this list by the current role before rendering, so a
 * `staff` user never sees a link to `/users`. This is UX only — the route
 * guard in `_protected/users.tsx` is what actually blocks the URL, and the
 * server is what actually protects the data.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    title: "nav.dashboard",
    to: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "nav.services",
    to: "/services",
    icon: WrenchIcon,
    roles: [ROLES.SUPERADMIN],
  },
  {
    title: "nav.requests",
    to: "/requests",
    icon: InboxIcon,
    roles: [ROLES.SUPERADMIN],
  },
  {
    title: "nav.cardPayments",
    to: "/card-payments",
    icon: CreditCardIcon,
    roles: [ROLES.SUPERADMIN],
  },
  {
    title: "nav.users",
    to: "/users",
    icon: UsersIcon,
    roles: [ROLES.SUPERADMIN],
  },
  {
    title: "nav.settings",
    to: "/settings",
    icon: Settings2Icon,
  },
]
