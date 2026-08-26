import { Trash2Icon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Can } from "@/features/auth/components/can"
import { ROLES } from "@/features/auth/roles"
import type { User } from "@/features/auth/schemas"
import { useLocaleStore } from "@/features/locale/store"
import { formatDate } from "@/lib/utils"
import { RoleBadge } from "./role-badge"

const COLUMN_KEYS = [
  "users.columns.name",
  "users.columns.email",
  "users.columns.role",
  "users.columns.added",
  "",
] as const

interface UsersTableProps {
  users: User[]
  onDelete: (user: User) => void
  /** The signed-in user's own id — deleting yourself is disabled. */
  currentUserId: string | undefined
}

export function UsersTable({
  users,
  onDelete,
  currentUserId,
}: UsersTableProps) {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {COLUMN_KEYS.map((key, index) => (
              <TableHead
                key={key || "actions"}
                className={
                  index === COLUMN_KEYS.length - 1 ? "w-12" : undefined
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
                colSpan={COLUMN_KEYS.length}
                className="h-24 text-center text-muted-foreground"
              >
                {t("users.empty")}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.createdAt, locale)}
                </TableCell>
                <TableCell>
                  {/*
                    Gating layer 3 of 3: the component-level check. The whole
                    page is already superadmin-only, but this is the pattern to
                    copy for admin actions living inside a *shared* page.
                  */}
                  <Can role={ROLES.SUPERADMIN}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      disabled={user.id === currentUserId}
                      title={
                        user.id === currentUserId
                          ? t("users.cannotDeleteSelf")
                          : t("users.deleteAction", { name: user.name })
                      }
                      onClick={() => onDelete(user)}
                    >
                      <Trash2Icon className="size-4" />
                      <span className="sr-only">
                        {t("users.deleteAction", { name: user.name })}
                      </span>
                    </Button>
                  </Can>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export function UsersTableSkeleton({ rows = 5 }: { rows?: number }) {
  const { t } = useTranslation()

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {COLUMN_KEYS.map((key) => (
              <TableHead key={key || "actions"}>
                {key ? t(key) : null}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="size-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
