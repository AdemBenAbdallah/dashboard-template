import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { apiErrorMessage } from "@/lib/api-error"
import { deleteUser, inviteUser, userQueries } from "../api/users-api"
import { userKeys } from "../keys"
import type { InviteUserInput } from "../schemas"

export function useUsers() {
  return useQuery(userQueries.list())
}

export function useInviteUser() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: InviteUserInput) => inviteUser(input),
    onSuccess: (user) => {
      toast.success(t("users.invite.toastSuccess", { email: user.email }))
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, t("users.invite.toastError")))
    },
  })
}

export function useDeleteUser() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success(t("users.delete.toastSuccess"))
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, t("users.delete.toastError")))
    },
  })
}
