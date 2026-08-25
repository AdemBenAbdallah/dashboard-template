import { z } from "zod"
import { ROLES } from "./roles"

/**
 * Every API response is parsed through one of these at the network boundary,
 * and the TS types are inferred from them so there is only one definition.
 */
export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  role: z.enum(ROLES),
  avatarUrl: z.url().nullable().default(null),
  createdAt: z.iso.datetime(),
})

export type User = z.infer<typeof userSchema>

export const sessionSchema = z.object({
  user: userSchema,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
})

export type Session = z.infer<typeof sessionSchema>

/** `/auth/refresh` rotates the pair but does not re-send the user. */
export const refreshResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
})

export type RefreshResponse = z.infer<typeof refreshResponseSchema>

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

export type LoginInput = z.infer<typeof loginSchema>
