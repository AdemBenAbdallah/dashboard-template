import { useQuery } from "@tanstack/react-query"
import { dashboardQueries } from "../api/dashboard-api"
import type { ChartRange, TableFilters } from "../schemas"

export function useDashboardStats() {
  return useQuery(dashboardQueries.stats())
}

export function useDashboardChart(range: ChartRange) {
  return useQuery(dashboardQueries.chart(range))
}

export function useDashboardTable(filters: TableFilters) {
  return useQuery(dashboardQueries.table(filters))
}
