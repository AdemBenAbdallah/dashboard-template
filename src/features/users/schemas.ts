import { z } from "zod"
import { DASHBOARD_ROLES } from "@/features/auth/roles"
import { userSchema } from "@/features/auth/schemas"
import { i18next } from "@/lib/i18n"

/** A user row is the same shape as the signed-in user. */
export const userListSchema = z.object({
  users: z.array(userSchema),
})

export type UserList = z.infer<typeof userListSchema>

/** A function so the messages pick up the active locale at validation time. */
export function inviteUserSchema() {
  return z.object({
    email: z.email(i18next.t("users.invite.emailInvalid")),
    name: z.string().min(2, i18next.t("users.invite.nameTooShort")),
    // Invitations are for dashboard users only — never a customer or
    // professional account, which are created through the mobile sign-up flows.
    role: z.enum(DASHBOARD_ROLES),
  })
}

export type InviteUserInput = z.infer<ReturnType<typeof inviteUserSchema>>
