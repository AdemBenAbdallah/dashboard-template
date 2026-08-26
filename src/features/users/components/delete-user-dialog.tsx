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
import type { User } from "@/features/auth/schemas"
import { useDeleteUser } from "../hooks/use-users"

interface DeleteUserDialogProps {
  /** The user pending deletion, or `null` when the dialog is closed. */
  user: User | null
  onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({
  user,
  onOpenChange,
}: DeleteUserDialogProps) {
  const { t } = useTranslation()
  const deleteUser = useDeleteUser()

  return (
    <AlertDialog open={user !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("users.delete.title", { name: user?.name })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("users.delete.description", { email: user?.email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUser.isPending}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteUser.isPending}
            onClick={(event) => {
              // Keep the dialog open until the request settles.
              event.preventDefault()
              if (!user) return
              deleteUser.mutate(user.id, {
                onSettled: () => onOpenChange(false),
              })
            }}
          >
            {deleteUser.isPending
              ? t("users.delete.confirming")
              : t("users.delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
