import { z } from "zod"
import {
  DEFAULT_PAGINATION,
  type PaginationParams,
  paginatedSchema,
} from "@/lib/pagination"

/** Time windows offered by the interactive area chart. */
export const CHART_RANGES = ["7d", "30d", "90d"] as const
export const chartRangeSchema = z.enum(CHART_RANGES)
export type ChartRange = z.infer<typeof chartRangeSchema>

/**
 * The API sends the *measurement*; the client owns the *copy*.
 *
 * `id` is the contract between the two: `SectionCards` looks up the label,
 * trend line and description under `dashboard.cards.<id>` in the active
 * locale. Adding a card means adding its `id` here and to both locale files.
 */
export const statCardSchema = z.object({
  id: z.string(),
  value: z.string(),
  /** Percentage change vs. the previous period; sign drives the trend arrow. */
  delta: z.number(),
})

export type StatCard = z.infer<typeof statCardSchema>

export const dashboardStatsSchema = z.object({
  cards: z.array(statCardSchema),
})

export type DashboardStats = z.infer<typeof dashboardStatsSchema>

export const chartPointSchema = z.object({
  date: z.string(),
  desktop: z.number(),
  mobile: z.number(),
})

export type ChartPoint = z.infer<typeof chartPointSchema>

export const chartResponseSchema = z.object({
  range: chartRangeSchema,
  points: z.array(chartPointSchema),
})

export type ChartResponse = z.infer<typeof chartResponseSchema>

export const tableRowSchema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
})

export type TableRow = z.infer<typeof tableRowSchema>

export const tableResponseSchema = paginatedSchema(tableRowSchema)

export type TableResponse = z.infer<typeof tableResponseSchema>

/** The dashboard table pages like every other list — see `lib/pagination.ts`. */
export type TableFilters = PaginationParams

export const DEFAULT_TABLE_FILTERS: TableFilters = DEFAULT_PAGINATION
