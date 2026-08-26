import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useCurrentUser } from "@/features/auth/hooks/use-auth"
import { ROLES } from "@/features/auth/roles"
import { requireRole } from "@/features/auth/route-guards"
import type { User } from "@/features/auth/schemas"
import { userQueries } from "@/features/users/api/users-api"
import { DeleteUserDialog } from "@/features/users/components/delete-user-dialog"
import { InviteUserDialog } from "@/features/users/components/invite-user-dialog"
import {
  UsersTable,
  UsersTableSkeleton,
} from "@/features/users/components/users-table"
import { useUsers } from "@/features/users/hooks/use-users"

/** The roles allowed here, declared once and reused by the guard. */
const ALLOWED_ROLES = [ROLES.SUPERADMIN] as const

export const Route = createFileRoute("/_protected/users")({
  staticData: { title: "nav.users", roles: ALLOWED_ROLES },
  // Gating layer 1 of 3. `_protected` already established that there *is* a
  // session; this narrows it to a role. A `staff` user who types /users
  // is redirected to /dashboard before the component ever mounts.
  beforeLoad: ({ context }) => requireRole(context, ALLOWED_ROLES),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(userQueries.list()),
  component: UsersPage,
})

function UsersPage() {
  const { t } = useTranslation()
  const { data: users } = useUsers()
  const currentUser = useCurrentUser()
  const [pendingDelete, setPendingDelete] = useState<User | null>(null)

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-lg">{t("users.heading")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("users.description")}
          </p>
        </div>
        <InviteUserDialog />
      </div>

      {users ? (
        <UsersTable
          users={users}
          currentUserId={currentUser?.id}
          onDelete={setPendingDelete}
        />
      ) : (
        <UsersTableSkeleton />
      )}

      <DeleteUserDialog
        user={pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      />
    </div>
  )
}
