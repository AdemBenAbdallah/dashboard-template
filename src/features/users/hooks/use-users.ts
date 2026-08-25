import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiErrorMessage } from "@/lib/api-error"
import { deleteUser, inviteUser, userQueries } from "../api/users-api"
import { userKeys } from "../keys"
import type { InviteUserInput } from "../schemas"

export function useUsers() {
  return useQuery(userQueries.list())
}

export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: InviteUserInput) => inviteUser(input),
    onSuccess: (user) => {
      toast.success(`Invitation sent to ${user.email}`)
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, "Could not send the invitation."))
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted")
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, "Could not delete the user."))
    },
  })
}
