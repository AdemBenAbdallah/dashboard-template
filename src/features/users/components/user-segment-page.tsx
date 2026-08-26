import { useState } from "react"
import { useTranslation } from "react-i18next"
import { TablePagination } from "@/components/shared/table-pagination"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { useCurrentUser } from "@/features/auth/hooks/use-auth"
import { hasRole, ROLES } from "@/features/auth/roles"
import { apiErrorMessage } from "@/lib/api-error"
import { DEFAULT_PAGINATION, type PaginationParams } from "@/lib/pagination"
import { useProfessionalApproval, useSegmentRows } from "../hooks/use-users"
import type { CustomerRow, ProfessionalRow } from "../schemas"
import { findSegment, type UserSegmentId } from "../segments"
import { CUSTOMER_COLUMN_KEYS, CustomersTable } from "./customers-table"
import { type DeletableRow, DeleteUserDialog } from "./delete-user-dialog"
import {
  PROFESSIONAL_COLUMN_KEYS,
  ProfessionalsTable,
} from "./professionals-table"
import { SegmentSearch } from "./segment-search"
import { USER_COLUMN_KEYS, UsersTable } from "./users-table"

/** Only these roles may destroy or approve accounts. */
const MUTATOR_ROLES = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN_DEVELOPER,
  ROLES.ADMIN,
] as const

const COLUMN_KEYS = {
  users: USER_COLUMN_KEYS,
  customers: CUSTOMER_COLUMN_KEYS,
  professionals: PROFESSIONAL_COLUMN_KEYS,
} as const

/**
 * One segment's list: search, table, pagination.
 *
 * All five segment routes render this; the row shape is chosen from the
 * segment's `source.kind`, which is also what picked the endpoint.
 */
export function UserSegmentPage({ segmentId }: { segmentId: UserSegmentId }) {
  const { t } = useTranslation()
  const segment = findSegment(segmentId)
  const currentUser = useCurrentUser()

  const [params, setParams] = useState<PaginationParams>(DEFAULT_PAGINATION)
  const [search, setSearch] = useState("")
  const [pendingDelete, setPendingDelete] = useState<DeletableRow | null>(null)

  const { data, isFetching, error } = useSegmentRows(segmentId, params, search)
  const approval = useProfessionalApproval()

  const canMutate = hasRole(currentUser?.role, MUTATOR_ROLES)

  // Searching from page 3 would otherwise land on an empty page.
  const handleSearch = (next: string) => {
    setSearch(next)
    setParams((current) => ({ ...current, page: 1 }))
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 p-6 text-center">
        <p className="font-medium text-sm">{t("users.loadError")}</p>
        <p className="mt-1 text-muted-foreground text-sm">
          {apiErrorMessage(error, t("common.error"))}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SegmentSearch value={search} onChange={handleSearch} />

      {data ? (
        <>
          {segment.source.kind === "users" ? (
            <UsersTable
              users={data.rows as never}
              currentUserId={currentUser?.id}
              canDelete={canMutate}
              onDelete={setPendingDelete}
            />
          ) : segment.source.kind === "customers" ? (
            <CustomersTable
              customers={data.rows as unknown as CustomerRow[]}
              canDelete={canMutate}
              onDelete={(row) =>
                setPendingDelete({
                  id: row.id,
                  name: row.user.name,
                  email: row.user.email,
                })
              }
            />
          ) : (
            <ProfessionalsTable
              professionals={data.rows as unknown as ProfessionalRow[]}
              canDelete={canMutate}
              canApprove={canMutate}
              pendingId={
                approval.isPending ? approval.variables?.id : undefined
              }
              onApprovalChange={(row, approve) =>
                approval.mutate({ id: row.id, approve })
              }
              onDelete={(row) =>
                setPendingDelete({
                  id: row.id,
                  name: row.user.name,
                  email: row.user.email,
                })
              }
            />
          )}

          <TablePagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onChange={setParams}
            disabled={isFetching}
          />
        </>
      ) : (
        <TableSkeleton
          columns={COLUMN_KEYS[segment.source.kind]}
          rows={params.pageSize}
        />
      )}

      <DeleteUserDialog
        row={pendingDelete}
        segmentId={segmentId}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      />
    </div>
  )
}
