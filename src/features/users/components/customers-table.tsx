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
import { useLocaleStore } from "@/features/locale/store"
import { formatDate } from "@/lib/utils"
import type { CustomerRow } from "../schemas"
import { AccountStatusBadge } from "./account-status-badge"
import { RowNameButton, rowClickHandler } from "./row-trigger"
import { UserCell } from "./user-cell"

export const CUSTOMER_COLUMN_KEYS = [
  "users.columns.name",
  "users.columns.email",
  "users.columns.phone",
  "users.columns.status",
  "users.columns.added",
  "",
] as const

export function CustomersTable({
  customers,
  onDelete,
  onOpen,
  canDelete,
}: {
  customers: readonly CustomerRow[]
  onDelete: (row: CustomerRow) => void
  onOpen: (row: CustomerRow) => void
  canDelete: boolean
}) {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {CUSTOMER_COLUMN_KEYS.map((key, index) => (
              <TableHead
                key={key || "actions"}
                className={
                  index === CUSTOMER_COLUMN_KEYS.length - 1 ? "w-12" : undefined
                }
              >
                {key ? t(key) : null}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={CUSTOMER_COLUMN_KEYS.length}
                className="h-24 text-center text-muted-foreground"
              >
                {t("users.empty")}
              </TableCell>
            </TableRow>
          ) : (
            customers.map((row) => (
              <TableRow
                key={row.id}
                onClick={rowClickHandler(() => onOpen(row))}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <RowNameButton onOpen={() => onOpen(row)}>
                    <UserCell user={row.user} />
                  </RowNameButton>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <Ltr>{row.user.email}</Ltr>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.user.phone ? <Ltr>{row.user.phone}</Ltr> : "—"}
                </TableCell>
                <TableCell>
                  <AccountStatusBadge status={row.user.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(row.createdAt, locale)}
                </TableCell>
                <TableCell>
                  {canDelete ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("users.deleteAction", {
                        name: row.user.name,
                      })}
                      onClick={() => onDelete(row)}
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
