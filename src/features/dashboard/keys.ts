import type { ChartRange, TableFilters } from "./schemas"

/**
 * Query key factory for the dashboard feature.
 *
 * `all` is the invalidation root: `queryClient.invalidateQueries({ queryKey:
 * dashboardKeys.all })` clears every dashboard query in one call.
 */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  charts: () => [...dashboardKeys.all, "chart"] as const,
  chart: (range: ChartRange) => [...dashboardKeys.charts(), range] as const,
  tables: () => [...dashboardKeys.all, "table"] as const,
  table: (filters: TableFilters) =>
    [...dashboardKeys.tables(), filters] as const,
}
