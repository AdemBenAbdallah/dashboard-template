import { z } from "zod"

/** Time windows offered by the interactive area chart. */
export const CHART_RANGES = ["7d", "30d", "90d"] as const
export const chartRangeSchema = z.enum(CHART_RANGES)
export type ChartRange = z.infer<typeof chartRangeSchema>

export const statCardSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  /** Percentage change vs. the previous period; sign drives the trend arrow. */
  delta: z.number(),
  trendLabel: z.string(),
  description: z.string(),
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

export const tableResponseSchema = z.object({
  rows: z.array(tableRowSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})

export type TableResponse = z.infer<typeof tableResponseSchema>

export interface TableFilters {
  page: number
  pageSize: number
}

export const DEFAULT_TABLE_FILTERS: TableFilters = { page: 1, pageSize: 10 }
