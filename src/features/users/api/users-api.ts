import { queryOptions } from "@tanstack/react-query"
import { type User, userSchema } from "@/features/auth/schemas"
import { apiClient } from "@/lib/api-client"
import { userKeys } from "../keys"
import { type InviteUserInput, userListSchema } from "../schemas"

async function fetchUsers(): Promise<User[]> {
  const response = await apiClient.get("/users")
  return userListSchema.parse(response.data).users
}

export async function inviteUser(input: InviteUserInput): Promise<User> {
  const response = await apiClient.post("/users", input)
  return userSchema.parse(response.data)
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`)
}

export const userQueries = {
  list: () =>
    queryOptions({
      queryKey: userKeys.list(),
      queryFn: fetchUsers,
    }),
}
