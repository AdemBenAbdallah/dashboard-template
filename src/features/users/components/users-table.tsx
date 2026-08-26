import { Trash2Icon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Ltr } from "@/components/shared/ltr"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { User } from "@/features/auth/schemas"
import { useLocaleStore } from "@/features/locale/store"
import { formatDate } from "@/lib/utils"
import { AccountStatusBadge } from "./account-status-badge"
import { RoleBadge } from "./role-badge"
import { RowNameButton, rowClickHandler } from "./row-trigger"
import { UserCell } from "./user-cell"

export const USER_COLUMN_KEYS = [
  "users.columns.name",
  "users.columns.email",
  "users.columns.phone",
  "users.columns.role",
  "users.columns.status",
  "users.columns.added",
  "",
] as const

interface UsersTableProps {
  users: readonly User[]
  onDelete: (user: User) => void
  onOpen: (user: User) => void
  /** The signed-in user's own id — deleting yourself is disabled. */
  currentUserId: string | undefined
  canDelete: boolean
}

/** The table behind the Super admins, Admins and Staff segments. */
export function UsersTable({
  users,
  onDelete,
  onOpen,
  currentUserId,
  canDelete,
}: UsersTableProps) {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {USER_COLUMN_KEYS.map((key, index) => (
              <TableHead
                key={key || "actions"}
                className={
                  index === USER_COLUMN_KEYS.length - 1 ? "w-12" : undefined
                }
              >
                {key ? t(key) : null}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={USER_COLUMN_KEYS.length}
                className="h-24 text-center text-muted-foreground"
              >
                {t("users.empty")}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                onClick={rowClickHandler(() => onOpen(user))}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <RowNameButton onOpen={() => onOpen(user)}>
                    <UserCell user={user} />
                  </RowNameButton>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <Ltr>{user.email}</Ltr>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.phone ? <Ltr>{user.phone}</Ltr> : "—"}
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <AccountStatusBadge status={user.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.createdAt, locale)}
                </TableCell>
                <TableCell>
                  {canDelete ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={user.id === currentUserId}
                      title={
                        user.id === currentUserId
                          ? t("users.cannotDeleteSelf")
                          : undefined
                      }
                      aria-label={t("users.deleteAction", { name: user.name })}
                      onClick={() => onDelete(user)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
