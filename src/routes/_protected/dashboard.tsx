import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { dashboardQueries } from "@/features/dashboard/api/dashboard-api"
import {
  ChartAreaInteractive,
  ChartAreaInteractiveSkeleton,
} from "@/features/dashboard/components/chart-area-interactive"
import {
  DataTable,
  DataTableSkeleton,
} from "@/features/dashboard/components/data-table"
import {
  SectionCards,
  SectionCardsSkeleton,
} from "@/features/dashboard/components/section-cards"
import {
  useDashboardChart,
  useDashboardStats,
  useDashboardTable,
} from "@/features/dashboard/hooks/use-dashboard"
import {
  type ChartRange,
  DEFAULT_TABLE_FILTERS,
  type TableFilters,
} from "@/features/dashboard/schemas"

const DEFAULT_RANGE: ChartRange = "90d"

export const Route = createFileRoute("/_protected/dashboard")({
  staticData: { title: "nav.dashboard" },
  // Warm the cache during navigation rather than after mount, so the page
  // does not waterfall three requests once it renders.
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(dashboardQueries.stats()),
      queryClient.ensureQueryData(dashboardQueries.chart(DEFAULT_RANGE)),
      queryClient.ensureQueryData(
        dashboardQueries.table(DEFAULT_TABLE_FILTERS),
      ),
    ]),
  component: DashboardPage,
})

function DashboardPage() {
  const [range, setRange] = useState<ChartRange>(DEFAULT_RANGE)
  const [filters, setFilters] = useState<TableFilters>(DEFAULT_TABLE_FILTERS)

  const stats = useDashboardStats()
  const chart = useDashboardChart(range)
  const table = useDashboardTable(filters)

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {stats.data ? (
        <SectionCards cards={stats.data.cards} />
      ) : (
        <SectionCardsSkeleton />
      )}

      <div className="px-4 lg:px-6">
        {chart.data ? (
          <ChartAreaInteractive
            points={chart.data.points}
            range={range}
            onRangeChange={setRange}
            isFetching={chart.isFetching}
          />
        ) : (
          <ChartAreaInteractiveSkeleton />
        )}
      </div>

      {table.data ? (
        <DataTable
          data={table.data.rows}
          page={table.data.page}
          pageSize={table.data.pageSize}
          total={table.data.total}
          onPaginationChange={setFilters}
        />
      ) : (
        <DataTableSkeleton rows={filters.pageSize} />
      )}
    </div>
  )
}
