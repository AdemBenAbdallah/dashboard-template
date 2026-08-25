import { z } from "zod"
import { ROLES } from "@/features/auth/roles"
import { userSchema } from "@/features/auth/schemas"

/** A user row is the same shape as the signed-in user. */
export const userListSchema = z.object({
  users: z.array(userSchema),
})

export type UserList = z.infer<typeof userListSchema>

export const inviteUserSchema = z.object({
  email: z.email("Enter a valid email address."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.enum(ROLES),
})

export type InviteUserInput = z.infer<typeof inviteUserSchema>
