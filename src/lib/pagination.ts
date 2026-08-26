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

/**
 * Query params in the shape iris-backend expects.
 *
 * Two mismatches with `PaginationParams`, both verified against the running
 * server: the backend's `page` is **0-based**, and it names the size `limit`,
 * not `pageSize`.
 */
export interface BackendPageParams {
  page: number
  limit: number
}

export function toBackendPageParams({
  page,
  pageSize,
}: PaginationParams): BackendPageParams {
  return { page: page - 1, limit: pageSize }
}

/**
 * Wraps an item schema in the envelope iris-backend's list endpoints return,
 * and adapts it to the `{rows, page, pageSize, total}` shape the tables and
 * `TablePagination` already speak.
 *
 * `/users` answers `{data, total, currentPage}`; `/customers` and
 * `/professionals` add `limit`. Where `limit` is absent the caller's requested
 * page size is the only source, so it is passed in.
 */
export function backendPaginatedSchema<TItem extends z.ZodType>(
  item: TItem,
  requestedPageSize: number,
) {
  return z
    .object({
      data: z.array(item),
      total: z.number().int().nonnegative(),
      currentPage: z.number().int().nonnegative(),
      limit: z.number().int().positive().nullish(),
    })
    .loose()
    .transform((envelope) => ({
      rows: envelope.data,
      // Back to 1-based for the UI.
      page: envelope.currentPage + 1,
      pageSize: envelope.limit ?? requestedPageSize,
      total: envelope.total,
    }))
}
