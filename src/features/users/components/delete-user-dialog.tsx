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
  const deleteUser = useDeleteUser()

  return (
    <AlertDialog open={user !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {user?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes {user?.email} and revokes their access immediately.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUser.isPending}>
            Cancel
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
            {deleteUser.isPending ? "Deleting…" : "Delete user"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
