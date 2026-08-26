import { z } from "zod"
import { i18next } from "@/lib/i18n"
import { ROLE_VALUES } from "./roles"

/**
 * Every API response is parsed through one of these at the network boundary,
 * and the TS types are inferred from them so there is only one definition.
 *
 * This file is the *only* place that knows the backend's wire format. The
 * iris-backend speaks snake_case token fields and a `UserDto`
 * (`src/users/dto/user.dto.ts`) keyed on `pubkey`/`firstName`/`lastName`; the
 * rest of the app sees the camelCase `User`/`Session` model produced by the
 * transforms below. Adapt here, never at a call site.
 */

/**
 * The account's address, a 1:1 relation on `User`.
 *
 * Arrives as a **raw Prisma row** — both the customers and professionals
 * services serialize with `excludeExtraneousValues: false` and nothing declares
 * this relation on `UserEntity`, so `id`, `createdAt` and `deletedAt` ride along
 * too. Only what is rendered is parsed.
 */
const apiAddressSchema = z
  .object({
    pubkey: z.string().nullish(),
    address: z.string().nullish(),
    latitude: z.number().nullish(),
    longitude: z.number().nullish(),
  })
  .loose()

/** `ImageDto` — the backend serves files by `path`; `filename` is the fallback. */
const apiImageSchema = z
  .object({
    path: z.string().nullish(),
    filename: z.string().nullish(),
    thumbnailname: z.string().nullish(),
  })
  .loose()

/**
 * `UserDto` exactly as it comes off the wire.
 *
 * `.loose()` throughout: the backend adds fields to this DTO over time and a
 * new one must never break an otherwise valid session.
 */
export const apiUserSchema = z
  .object({
    pubkey: z.string(),
    email: z.email(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    role: z.enum(ROLE_VALUES),
    image: apiImageSchema.nullish(),
    phone: z.string().nullish(),
    status: z.string().nullish(),
    // Verification is reported inconsistently, so accept every form the API
    // uses. `UserDto` declares `isEmailVerified`/`isPhoneVerified`, but they
    // are computed names with no column behind them, so the serializer drops
    // them: `/auth/signin` returns the raw `*VerifiedAt` timestamps instead,
    // and `/auth/profile` returns neither. See `verifiedFrom` below.
    isEmailVerified: z.boolean().nullish(),
    isPhoneVerified: z.boolean().nullish(),
    emailVerifiedAt: z.iso.datetime().nullish(),
    phoneVerifiedAt: z.iso.datetime().nullish(),
    createdAt: z.iso.datetime().nullish(),
    lastLogin: z.iso.datetime().nullish(),
    // Detail-only fields. They are on every list response too — the client was
    // simply discarding them until the detail modal needed them.
    idNumber: z.string().nullish(),
    birthday: z.string().nullish(),
    locale: z.string().nullish(),
    // Only the `/customers` and `/professionals` responses carry this;
    // `/users` and `/auth/profile` do not include the relation at all.
    address: apiAddressSchema.nullish(),
  })
  .loose()

/**
 * Resolves a verification flag, or `null` when the response simply did not say.
 *
 * `null` is not "unverified" — `/auth/profile` omits both the boolean and the
 * timestamp, so a page restored from a reload knows nothing either way and must
 * not claim the account is unverified.
 */
function verifiedFrom(
  flag: boolean | null | undefined,
  timestamp: string | null | undefined,
): boolean | null {
  if (typeof flag === "boolean") return flag
  if (timestamp !== undefined) return timestamp !== null
  return null
}

export const userSchema = apiUserSchema.transform((dto) => ({
  // `UserDto` excludes the numeric `id`; `pubkey` is the public identifier.
  id: dto.pubkey,
  email: dto.email,
  firstName: dto.firstName ?? "",
  lastName: dto.lastName ?? "",
  /** Pre-composed display name — the backend has no single `name` field. */
  name: `${dto.firstName ?? ""} ${dto.lastName ?? ""}`.trim() || dto.email,
  role: dto.role,
  avatarUrl: dto.image?.path ?? null,
  phone: dto.phone ?? null,
  status: dto.status ?? null,
  isEmailVerified: verifiedFrom(dto.isEmailVerified, dto.emailVerifiedAt),
  isPhoneVerified: verifiedFrom(dto.isPhoneVerified, dto.phoneVerifiedAt),
  idNumber: dto.idNumber ?? null,
  birthday: dto.birthday ?? null,
  locale: dto.locale ?? null,
  address: dto.address?.address
    ? {
        label: dto.address.address,
        latitude: dto.address.latitude ?? null,
        longitude: dto.address.longitude ?? null,
      }
    : null,
  createdAt: dto.createdAt ?? null,
  lastLogin: dto.lastLogin ?? null,
}))

export type User = z.infer<typeof userSchema>

/** `TokenResponseDto` from `POST /auth/signin`. */
export const sessionSchema = z
  .object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1),
    user: userSchema,
  })
  .loose()
  .transform((dto) => ({
    user: dto.user,
    accessToken: dto.access_token,
    refreshToken: dto.refresh_token,
  }))

export type Session = z.infer<typeof sessionSchema>

/**
 * `POST /auth/refresh-token` returns a new access token and *nothing else*.
 *
 * The backend does not rotate refresh tokens (`refreshTokenUser` in
 * `authentication.service.ts`), so the stored refresh token stays valid and
 * must be left untouched by a refresh.
 */
export const refreshResponseSchema = z
  .object({
    access_token: z.string().min(1),
  })
  .loose()
  .transform((dto) => ({ accessToken: dto.access_token }))

export type RefreshResponse = z.infer<typeof refreshResponseSchema>

/**
 * A function, not a static schema, so the messages pick up the active locale
 * at validation time rather than freezing whatever locale was active when
 * this module first loaded. Mirrors `roleLabel`'s call-time `i18next.t()`.
 */
export function loginSchema() {
  return z.object({
    email: z.email(i18next.t("auth.login.emailInvalid")),
    password: z.string().min(8, i18next.t("auth.login.passwordTooShort")),
  })
}

export type LoginInput = z.infer<ReturnType<typeof loginSchema>>
