import { useQuery } from "@tanstack/react-query"
import type { PaginationParams } from "@/lib/pagination"
import { serviceQueries } from "../api/services-api"

export function useServices(params: PaginationParams) {
  return useQuery({
    ...serviceQueries.list(params),
    // Keeps the previous page on screen while the next one loads, so paging
    // doesn't flash a skeleton.
    placeholderData: (previous) => previous,
  })
}
