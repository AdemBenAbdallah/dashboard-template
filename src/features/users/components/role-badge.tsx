import { ShieldCheckIcon, UserIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { hasRole, ROLES, type Role, roleLabel } from "@/features/auth/roles"

/** The roles that carry administrative authority get the emphasised variant. */
const PRIVILEGED_ROLES = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN_DEVELOPER,
  ROLES.ADMIN,
] as const

export function RoleBadge({ role }: { role: Role }) {
  // Subscribes this badge to locale changes; `roleLabel` reads i18next directly.
  useTranslation()
  const privileged = hasRole(role, PRIVILEGED_ROLES)
  const Icon = privileged ? ShieldCheckIcon : UserIcon

  return (
    <Badge variant={privileged ? "default" : "secondary"} className="gap-1">
      <Icon className="size-3" />
      {roleLabel(role)}
    </Badge>
  )
}
