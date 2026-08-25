import { useQuery } from "@tanstack/react-query"
import type { PaginationParams } from "@/lib/pagination"
import { requestQueries } from "../api/requests-api"

export function useRequests(params: PaginationParams) {
  return useQuery({
    ...requestQueries.list(params),
    placeholderData: (previous) => previous,
  })
}
