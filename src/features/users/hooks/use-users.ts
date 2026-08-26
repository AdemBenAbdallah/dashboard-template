import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { apiErrorMessage } from "@/lib/api-error"
import type { PaginationParams } from "@/lib/pagination"
import {
  approveProfessional,
  deleteSegmentRow,
  revokeProfessional,
  segmentQueries,
} from "../api/users-api"
import { userKeys } from "../keys"
import type { UserSegmentId } from "../segments"

export function useSegmentRows(
  segmentId: UserSegmentId,
  params: PaginationParams,
  search: string,
) {
  return useQuery(segmentQueries.list(segmentId, params, search))
}

/** Invalidates every segment list — a status change can move a row between them. */
function useInvalidateSegments() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: userKeys.lists() })
}

export function useDeleteSegmentRow(segmentId: UserSegmentId) {
  const { t } = useTranslation()
  const invalidate = useInvalidateSegments()

  return useMutation({
    mutationFn: (id: string) => deleteSegmentRow(segmentId, id),
    onSuccess: () => {
      toast.success(t("users.delete.toastSuccess"))
      invalidate()
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, t("users.delete.toastError")))
    },
  })
}

export function useProfessionalApproval() {
  const { t } = useTranslation()
  const invalidate = useInvalidateSegments()

  return useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      approve ? approveProfessional(id) : revokeProfessional(id),
    onSuccess: (_data, { approve }) => {
      toast.success(
        t(
          approve
            ? "users.approve.toastApproved"
            : "users.approve.toastRevoked",
        ),
      )
      invalidate()
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, t("users.approve.toastError")))
    },
  })
}
