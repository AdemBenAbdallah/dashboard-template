import { queryOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { PaginationParams } from "@/lib/pagination"
import { requestKeys } from "../keys"
import { requestListSchema } from "../schemas"

async function fetchRequests(params: PaginationParams) {
  const response = await apiClient.get("/requests", { params })
  return requestListSchema.parse(response.data)
}

export const requestQueries = {
  list: (params: PaginationParams) =>
    queryOptions({
      queryKey: requestKeys.list(params),
      queryFn: () => fetchRequests(params),
    }),
}
