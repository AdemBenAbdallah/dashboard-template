import { queryOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { dashboardKeys } from "../keys"
import {
  type ChartRange,
  chartResponseSchema,
  dashboardStatsSchema,
  type TableFilters,
  tableResponseSchema,
} from "../schemas"

async function fetchStats() {
  const response = await apiClient.get("/dashboard/stats")
  return dashboardStatsSchema.parse(response.data)
}

async function fetchChart(range: ChartRange) {
  const response = await apiClient.get("/dashboard/chart", {
    params: { range },
  })
  return chartResponseSchema.parse(response.data)
}

async function fetchTable(filters: TableFilters) {
  const response = await apiClient.get("/dashboard/table", { params: filters })
  return tableResponseSchema.parse(response.data)
}

/**
 * `queryOptions` objects are shared by route loaders (via
 * `queryClient.ensureQueryData`) and by the components' `useQuery`, so a
 * navigation prefetch and the render read the exact same cache entry.
 */
export const dashboardQueries = {
  stats: () =>
    queryOptions({
      queryKey: dashboardKeys.stats(),
      queryFn: fetchStats,
    }),
  chart: (range: ChartRange) =>
    queryOptions({
      queryKey: dashboardKeys.chart(range),
      queryFn: () => fetchChart(range),
    }),
  table: (filters: TableFilters) =>
    queryOptions({
      queryKey: dashboardKeys.table(filters),
      queryFn: () => fetchTable(filters),
    }),
}
