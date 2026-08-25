import { ShieldCheckIcon, UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ROLES, type Role, roleLabel } from "@/features/auth/roles"

const ROLE_VARIANT: Record<Role, "default" | "secondary"> = {
  [ROLES.SUPERADMIN]: "default",
  [ROLES.PROFICIENT]: "secondary",
}

export function RoleBadge({ role }: { role: Role }) {
  const Icon = role === ROLES.SUPERADMIN ? ShieldCheckIcon : UserIcon

  return (
    <Badge variant={ROLE_VARIANT[role]} className="gap-1">
      <Icon className="size-3" />
      {roleLabel(role)}
    </Badge>
  )
}
