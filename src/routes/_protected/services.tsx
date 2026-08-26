import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader } from "@/components/shared/page-header"
import { TablePagination } from "@/components/shared/table-pagination"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { ROLES } from "@/features/auth/roles"
import { requireRole } from "@/features/auth/route-guards"
import { serviceQueries } from "@/features/services/api/services-api"
import {
  SERVICE_COLUMN_KEYS,
  ServicesTable,
} from "@/features/services/components/services-table"
import { useServices } from "@/features/services/hooks/use-services"
import { DEFAULT_PAGINATION, type PaginationParams } from "@/lib/pagination"

const ALLOWED_ROLES = [ROLES.SUPERADMIN] as const

export const Route = createFileRoute("/_protected/services")({
  staticData: { title: "services.title", roles: ALLOWED_ROLES },
  beforeLoad: ({ context }) => requireRole(context, ALLOWED_ROLES),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(serviceQueries.list(DEFAULT_PAGINATION)),
  component: ServicesPage,
})

function ServicesPage() {
  const { t } = useTranslation()
  const [params, setParams] = useState<PaginationParams>(DEFAULT_PAGINATION)
  const { data, isFetching } = useServices(params)

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <PageHeader
        title={t("services.title")}
        description={t("common.placeholderListDescription")}
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
        <TableSkeleton columns={SERVICE_COLUMN_KEYS} rows={params.pageSize} />
      )}
    </div>
  )
}
