import { queryOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { PaginationParams } from "@/lib/pagination"
import { serviceKeys } from "../keys"
import { serviceListSchema } from "../schemas"

async function fetchServices(params: PaginationParams) {
  const response = await apiClient.get("/services", { params })
  return serviceListSchema.parse(response.data)
}

export const serviceQueries = {
  list: (params: PaginationParams) =>
    queryOptions({
      queryKey: serviceKeys.list(params),
      queryFn: () => fetchServices(params),
    }),
}
