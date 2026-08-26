import type { PaginationParams } from "@/lib/pagination"
import type { UserSegmentId } from "./segments"

/**
 * Query key factory for the users feature.
 *
 * Segment, page and search all belong in the key: two segments are different
 * requests to different endpoints, and React Query must not serve one from the
 * other's cache.
 */
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (segmentId: UserSegmentId, params: PaginationParams, search: string) =>
    [...userKeys.lists(), segmentId, params, search] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
}
