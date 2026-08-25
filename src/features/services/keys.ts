import type { PaginationParams } from "@/lib/pagination"

/** Query key factory for the services feature. */
export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (params: PaginationParams) => [...serviceKeys.lists(), params] as const,
  detail: (id: string) => [...serviceKeys.all, "detail", id] as const,
}
