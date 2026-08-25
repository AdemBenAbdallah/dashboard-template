/** Query key factory for the users feature. */
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: () => [...userKeys.lists()] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
}
