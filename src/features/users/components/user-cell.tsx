import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/features/auth/schemas"

/** Initials fallback — the backend often has no avatar for internal accounts. */
function initials(user: User): string {
  const letters = `${user.firstName.at(0) ?? ""}${user.lastName.at(0) ?? ""}`
  return letters.trim() || user.email.slice(0, 2).toUpperCase()
}

/** Name + avatar, shared by every users table. */
export function UserCell({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-7">
        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
        <AvatarFallback className="text-xs">{initials(user)}</AvatarFallback>
      </Avatar>
      <span className="font-medium">{user.name}</span>
    </div>
  )
}
