import { z } from "zod"

/** Query params every paginated list endpoint accepts. */
export interface PaginationParams {
  page: number
  pageSize: number
}

export const DEFAULT_PAGINATION: PaginationParams = { page: 1, pageSize: 10 }

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const

/**
 * Wraps an item schema in the envelope every list endpoint returns.
 *
 * ```ts
 * const serviceListSchema = paginatedSchema(serviceSchema)
 * type ServiceList = z.infer<typeof serviceListSchema>
 * ```
 */
export function paginatedSchema<TItem extends z.ZodType>(item: TItem) {
  return z.object({
    rows: z.array(item),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })
}

/** Total pages for a row count, never less than 1. */
export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize))
}
