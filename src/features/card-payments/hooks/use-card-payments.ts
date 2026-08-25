import { useQuery } from "@tanstack/react-query"
import type { PaginationParams } from "@/lib/pagination"
import { cardPaymentQueries } from "../api/card-payments-api"

export function useCardPayments(params: PaginationParams) {
  return useQuery({
    ...cardPaymentQueries.list(params),
    placeholderData: (previous) => previous,
  })
}
