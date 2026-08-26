import { useTranslation } from "react-i18next"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteSegmentRow } from "../hooks/use-users"
import type { UserSegmentId } from "../segments"

/** The minimum a row needs to be deletable, whatever segment it came from. */
export interface DeletableRow {
  id: string
  name: string
  email: string
}

interface DeleteUserDialogProps {
  /** The row pending deletion, or `null` when the dialog is closed. */
  row: DeletableRow | null
  segmentId: UserSegmentId
  onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({
  row,
  segmentId,
  onOpenChange,
}: DeleteUserDialogProps) {
  const { t } = useTranslation()
  const deleteRow = useDeleteSegmentRow(segmentId)

  return (
    <AlertDialog open={row !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("users.delete.title", { name: row?.name })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("users.delete.description", { email: row?.email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteRow.isPending}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteRow.isPending}
            onClick={(event) => {
              // Keep the dialog open until the request settles.
              event.preventDefault()
              if (!row) return
              deleteRow.mutate(row.id, {
                onSettled: () => onOpenChange(false),
              })
            }}
          >
            {deleteRow.isPending
              ? t("users.delete.confirming")
              : t("users.delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
