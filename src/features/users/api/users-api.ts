import { queryOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import {
  backendPaginatedSchema,
  type PaginationParams,
  toBackendPageParams,
} from "@/lib/pagination"
import { userKeys } from "../keys"
import {
  customerRowSchema,
  professionalRowSchema,
  userSchema,
} from "../schemas"
import { findSegment, type UserSegment, type UserSegmentId } from "../segments"

/** The endpoint each segment source reads from. */
const SOURCE_PATH = {
  users: "/users",
  customers: "/customers",
  professionals: "/professionals",
} as const

/**
 * A page of rows for one segment.
 *
 * The row type differs by source — a plain user for `/users`, a wrapper for the
 * other two — so callers narrow on the segment's `source.kind` rather than
 * this returning a union of tables' worth of fields.
 */
async function fetchSegment(
  segment: UserSegment,
  params: PaginationParams,
  search: string,
) {
  const query: Record<string, unknown> = {
    ...toBackendPageParams(params),
    ...(search ? { search } : {}),
  }

  // Repeat-format serialisation matters here — see the note on `paramsSerializer`
  // in `src/lib/api-client.ts`.
  if (segment.source.kind === "users") {
    query.role = [...segment.source.roles]
  }

  const response = await apiClient.get(SOURCE_PATH[segment.source.kind], {
    params: query,
  })

  const item =
    segment.source.kind === "users"
      ? userSchema
      : segment.source.kind === "customers"
        ? customerRowSchema
        : professionalRowSchema

  return backendPaginatedSchema(item, params.pageSize).parse(response.data)
}

export const segmentQueries = {
  list: (segmentId: UserSegmentId, params: PaginationParams, search = "") =>
    queryOptions({
      queryKey: userKeys.list(segmentId, params, search),
      queryFn: () => fetchSegment(findSegment(segmentId), params, search),
    }),
}

/**
 * Deletes a row from the endpoint that owns it.
 *
 * Customers and professionals are profile records, so deleting one goes to its
 * own resource rather than to `/users` — the account is cascaded by the server.
 */
export async function deleteSegmentRow(
  segmentId: UserSegmentId,
  id: string,
): Promise<void> {
  const segment = findSegment(segmentId)
  await apiClient.delete(`${SOURCE_PATH[segment.source.kind]}/${id}`)
}

/** Approval and revocation both write `User.status` server-side. */
export async function approveProfessional(id: string): Promise<void> {
  await apiClient.patch(`/professionals/${id}/approve`)
}

export async function revokeProfessional(id: string): Promise<void> {
  await apiClient.patch(`/professionals/${id}/revoke`)
}
