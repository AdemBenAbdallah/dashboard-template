import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { TablePagination } from "@/components/shared/table-pagination"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { ROLES } from "@/features/auth/roles"
import { requireRole } from "@/features/auth/route-guards"
import { requestQueries } from "@/features/requests/api/requests-api"
import {
  REQUEST_COLUMNS,
  RequestsTable,
} from "@/features/requests/components/requests-table"
import { useRequests } from "@/features/requests/hooks/use-requests"
import { DEFAULT_PAGINATION, type PaginationParams } from "@/lib/pagination"

const ALLOWED_ROLES = [ROLES.SUPERADMIN] as const

export const Route = createFileRoute("/_protected/requests")({
  staticData: { title: "Requests", roles: ALLOWED_ROLES },
  beforeLoad: ({ context }) => requireRole(context, ALLOWED_ROLES),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(requestQueries.list(DEFAULT_PAGINATION)),
  component: RequestsPage,
})

function RequestsPage() {
  const [params, setParams] = useState<PaginationParams>(DEFAULT_PAGINATION)
  const { data, isFetching } = useRequests(params)

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <PageHeader
        title="Requests"
        description="Placeholder list — columns will change once the real shape is known."
      />

      {data ? (
        <>
          <RequestsTable requests={data.rows} />
          <TablePagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onChange={setParams}
            disabled={isFetching}
          />
        </>
      ) : (
        <TableSkeleton columns={REQUEST_COLUMNS} rows={params.pageSize} />
      )}
    </div>
  )
}
