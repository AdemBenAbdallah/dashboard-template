import { CheckIcon, Trash2Icon, XIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Ltr } from "@/components/shared/ltr"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ProfessionalRow } from "../schemas"
import { AccountStatusBadge } from "./account-status-badge"
import { RowNameButton, rowClickHandler } from "./row-trigger"
import { UserCell } from "./user-cell"

export const PROFESSIONAL_COLUMN_KEYS = [
  "users.columns.name",
  "users.columns.email",
  "users.columns.company",
  "users.columns.siret",
  "users.columns.tools",
  "users.columns.status",
  "",
] as const

export function ProfessionalsTable({
  professionals,
  onDelete,
  onOpen,
  onApprovalChange,
  canDelete,
  canApprove,
  pendingId,
}: {
  professionals: readonly ProfessionalRow[]
  onDelete: (row: ProfessionalRow) => void
  onOpen: (row: ProfessionalRow) => void
  onApprovalChange: (row: ProfessionalRow, approve: boolean) => void
  canDelete: boolean
  canApprove: boolean
  /** Row currently awaiting a mutation, so its buttons can be disabled. */
  pendingId?: string
}) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {PROFESSIONAL_COLUMN_KEYS.map((key, index) => (
              <TableHead
                key={key || "actions"}
                className={
                  index === PROFESSIONAL_COLUMN_KEYS.length - 1
                    ? "w-24"
                    : undefined
                }
              >
                {key ? t(key) : null}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {professionals.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={PROFESSIONAL_COLUMN_KEYS.length}
                className="h-24 text-center text-muted-foreground"
              >
                {t("users.empty")}
              </TableCell>
            </TableRow>
          ) : (
            professionals.map((row) => {
              // Approval is a status transition, not a flag on the profile.
              const awaitingApproval = row.user.status === "INACTIVE"
              const busy = pendingId === row.id
              const area = row.area?.label ?? null

              return (
                <TableRow
                  key={row.id}
                  onClick={rowClickHandler(() => onOpen(row))}
                  // Pending applications are what an admin is here to action.
                  className={
                    awaitingApproval
                      ? "cursor-pointer bg-amber-500/5 hover:bg-amber-500/10"
                      : "cursor-pointer hover:bg-muted/50"
                  }
                >
                  <TableCell>
                    <RowNameButton onOpen={() => onOpen(row)}>
                      <UserCell user={row.user} />
                    </RowNameButton>
                    {area ? (
                      <span className="text-muted-foreground text-xs">
                        {area}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Ltr>{row.user.email}</Ltr>
                  </TableCell>
                  <TableCell>
                    {row.company || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.siret ? <Ltr>{row.siret}</Ltr> : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.hasTools ? "secondary" : "outline"}>
                      {t(row.hasTools ? "users.tools.own" : "users.tools.iris")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AccountStatusBadge status={row.user.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {canApprove ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busy}
                          aria-label={t(
                            awaitingApproval
                              ? "users.approve.approveAction"
                              : "users.approve.revokeAction",
                            { name: row.user.name },
                          )}
                          onClick={() =>
                            onApprovalChange(row, awaitingApproval)
                          }
                        >
                          {awaitingApproval ? (
                            <CheckIcon className="size-4" />
                          ) : (
                            <XIcon className="size-4" />
                          )}
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busy}
                          aria-label={t("users.deleteAction", {
                            name: row.user.name,
                          })}
                          onClick={() => onDelete(row)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
