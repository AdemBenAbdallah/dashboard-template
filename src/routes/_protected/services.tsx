import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { TablePagination } from "@/components/shared/table-pagination"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { ROLES } from "@/features/auth/roles"
import { requireRole } from "@/features/auth/route-guards"
import { serviceQueries } from "@/features/services/api/services-api"
import {
  SERVICE_COLUMNS,
  ServicesTable,
} from "@/features/services/components/services-table"
import { useServices } from "@/features/services/hooks/use-services"
import { DEFAULT_PAGINATION, type PaginationParams } from "@/lib/pagination"

const ALLOWED_ROLES = [ROLES.SUPERADMIN] as const

export const Route = createFileRoute("/_protected/services")({
  staticData: { title: "Services", roles: ALLOWED_ROLES },
  beforeLoad: ({ context }) => requireRole(context, ALLOWED_ROLES),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(serviceQueries.list(DEFAULT_PAGINATION)),
  component: ServicesPage,
})

function ServicesPage() {
  const [params, setParams] = useState<PaginationParams>(DEFAULT_PAGINATION)
  const { data, isFetching } = useServices(params)

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <PageHeader
        title="Services"
        description="Placeholder list — columns will change once the real shape is known."
      />

      {data ? (
        <>
          <ServicesTable services={data.rows} />
          <TablePagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onChange={setParams}
            disabled={isFetching}
          />
        </>
      ) : (
        <TableSkeleton columns={SERVICE_COLUMNS} rows={params.pageSize} />
      )}
    </div>
  )
}
