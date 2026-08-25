import { useQuery } from "@tanstack/react-query"
import { dashboardQueries } from "../api/dashboard-api"
import type { ChartRange, TableFilters } from "../schemas"

export function useDashboardStats() {
  return useQuery(dashboardQueries.stats())
}

// Switching range or page changes the query key, so without `placeholderData`
// the previous result disappears and the page falls back to its skeleton —
// a full unmount and a visible jump. Keeping the previous data means the chart
// and table stay on screen and merely dim while the next page loads, which is
// what the `isFetching` prop on the chart is for.
export function useDashboardChart(range: ChartRange) {
  return useQuery({
    ...dashboardQueries.chart(range),
    placeholderData: (previous) => previous,
  })
}

export function useDashboardTable(filters: TableFilters) {
  return useQuery({
    ...dashboardQueries.table(filters),
    placeholderData: (previous) => previous,
  })
}
