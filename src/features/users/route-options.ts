import { requireRole } from "@/features/auth/route-guards"
import { DEFAULT_PAGINATION } from "@/lib/pagination"
import type { RouterContext } from "@/routes/__root"
import { segmentQueries } from "./api/users-api"
import { findSegment, type UserSegmentId } from "./segments"

/**
 * The guard + loader every segment route shares.
 *
 * Each of the five route files is otherwise identical, so the parts that must
 * stay in sync with `segments.ts` — the role check and the prefetch — live here
 * rather than being copied five times.
 */
export function segmentRouteOptions(segmentId: UserSegmentId) {
  const segment = findSegment(segmentId)

  return {
    staticData: { title: segment.titleKey, roles: segment.viewers },
    beforeLoad: ({ context }: { context: RouterContext }) =>
      requireRole(context, segment.viewers),
    loader: ({ context }: { context: RouterContext }) =>
      context.queryClient.ensureQueryData(
        segmentQueries.list(segmentId, DEFAULT_PAGINATION, ""),
      ),
  }
}
