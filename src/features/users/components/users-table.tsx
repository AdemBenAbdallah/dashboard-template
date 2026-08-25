import { Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Can } from "@/features/auth/components/can"
import { ROLES } from "@/features/auth/roles"
import type { User } from "@/features/auth/schemas"
import { RoleBadge } from "./role-badge"

const COLUMNS = ["Name", "Email", "Role", "Added", ""] as const

interface UsersTableProps {
  users: User[]
  onDelete: (user: User) => void
  /** The signed-in user's own id — deleting yourself is disabled. */
  currentUserId: string | undefined
}

export function UsersTable({
  users,
  onDelete,
  currentUserId,
}: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {COLUMNS.map((column, index) => (
              <TableHead
                key={column || "actions"}
                className={index === COLUMNS.length - 1 ? "w-12" : undefined}
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="h-24 text-center text-muted-foreground"
              >
                No users yet.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    dateStyle: "medium",
                  })}
                </TableCell>
                <TableCell>
                  {/*
                    Gating layer 3 of 3: the component-level check. The whole
                    page is already superadmin-only, but this is the pattern to
                    copy for admin actions living inside a *shared* page.
                  */}
                  <Can role={ROLES.SUPERADMIN}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      disabled={user.id === currentUserId}
                      title={
                        user.id === currentUserId
                          ? "You cannot delete your own account"
                          : `Delete ${user.name}`
                      }
                      onClick={() => onDelete(user)}
                    >
                      <Trash2Icon className="size-4" />
                      <span className="sr-only">Delete {user.name}</span>
                    </Button>
                  </Can>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export function UsersTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {COLUMNS.map((column) => (
              <TableHead key={column || "actions"}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="size-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
