import { queryOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { PaginationParams } from "@/lib/pagination"
import { cardPaymentKeys } from "../keys"
import { cardPaymentListSchema } from "../schemas"

async function fetchCardPayments(params: PaginationParams) {
  const response = await apiClient.get("/card-payments", { params })
  return cardPaymentListSchema.parse(response.data)
}

export const cardPaymentQueries = {
  list: (params: PaginationParams) =>
    queryOptions({
      queryKey: cardPaymentKeys.list(params),
      queryFn: () => fetchCardPayments(params),
    }),
}
