import type { PaginationParams } from "@/lib/pagination"

/** Query key factory for the requests feature. */
export const requestKeys = {
  all: ["requests"] as const,
  lists: () => [...requestKeys.all, "list"] as const,
  list: (params: PaginationParams) => [...requestKeys.lists(), params] as const,
  detail: (id: string) => [...requestKeys.all, "detail", id] as const,
}
