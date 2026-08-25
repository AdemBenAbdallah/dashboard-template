import type { PaginationParams } from "@/lib/pagination"

/** Query key factory for the card payments feature. */
export const cardPaymentKeys = {
  all: ["card-payments"] as const,
  lists: () => [...cardPaymentKeys.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...cardPaymentKeys.lists(), params] as const,
  detail: (id: string) => [...cardPaymentKeys.all, "detail", id] as const,
}
