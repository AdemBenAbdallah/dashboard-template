import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader } from "@/components/shared/page-header"
import { TablePagination } from "@/components/shared/table-pagination"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { ROLES } from "@/features/auth/roles"
import { requireRole } from "@/features/auth/route-guards"
import { cardPaymentQueries } from "@/features/card-payments/api/card-payments-api"
import {
  CARD_PAYMENT_COLUMN_KEYS,
  CardPaymentsTable,
} from "@/features/card-payments/components/card-payments-table"
import { useCardPayments } from "@/features/card-payments/hooks/use-card-payments"
import { DEFAULT_PAGINATION, type PaginationParams } from "@/lib/pagination"

const ALLOWED_ROLES = [ROLES.SUPERADMIN] as const

export const Route = createFileRoute("/_protected/card-payments")({
  staticData: { title: "cardPayments.title", roles: ALLOWED_ROLES },
  beforeLoad: ({ context }) => requireRole(context, ALLOWED_ROLES),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(cardPaymentQueries.list(DEFAULT_PAGINATION)),
  component: CardPaymentsPage,
})

function CardPaymentsPage() {
  const { t } = useTranslation()
  const [params, setParams] = useState<PaginationParams>(DEFAULT_PAGINATION)
  const { data, isFetching } = useCardPayments(params)

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <PageHeader
        title={t("cardPayments.title")}
        description={t("common.placeholderListDescription")}
      />

      {data ? (
        <>
          <CardPaymentsTable payments={data.rows} />
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
          columns={CARD_PAYMENT_COLUMN_KEYS}
          rows={params.pageSize}
        />
      )}
    </div>
  )
}
