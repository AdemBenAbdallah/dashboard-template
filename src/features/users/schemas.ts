import { z } from "zod"
import { userSchema } from "@/features/auth/schemas"

/**
 * A `/users` row is the same `UserDto` the auth layer already parses, so the
 * schema — and its handling of the backend's inconsistent verification
 * fields — is reused rather than restated.
 */
export { userSchema }

/**
 * `/customers` and `/professionals` return *wrapper* rows: a profile record
 * with the account nested under `user`. Flattened here so the tables see one
 * predictable shape.
 */
/**
 * A service area. The raw row also carries `boundary`, `centreLatitude`,
 * `centreLongitude` and `colorTag`, none of which this feature renders, so the
 * transform below narrows it to the two fields that are used.
 *
 * `name` is a MultiLanguageString relation, not a string — it is only rendered
 * when it actually resolves to text.
 */
const areaSchema = z
  .object({
    pubkey: z.string(),
    name: z.unknown().nullish(),
  })
  .loose()

/** Pulls a displayable label out of the area's translated-name relation. */
function areaLabel(name: unknown): string | null {
  if (typeof name === "string") return name || null
  if (name && typeof name === "object") {
    for (const key of ["en", "ar", "value", "text"]) {
      const candidate = (name as Record<string, unknown>)[key]
      if (typeof candidate === "string" && candidate) return candidate
    }
  }
  return null
}

const partnerCompanySchema = z
  .object({
    pubkey: z.string(),
    name: z.string().nullish(),
    isActive: z.boolean().nullish(),
  })
  .loose()

export const customerRowSchema = z
  .object({
    pubkey: z.string(),
    user: userSchema,
    note: z.string().nullish(),
    createdAt: z.iso.datetime().nullish(),
  })
  .loose()
  .transform((row) => ({
    id: row.pubkey,
    user: row.user,
    note: row.note ?? null,
    createdAt: row.createdAt ?? row.user.createdAt,
  }))

export type CustomerRow = z.infer<typeof customerRowSchema>

export const professionalRowSchema = z
  .object({
    pubkey: z.string(),
    user: userSchema,
    hasTools: z.boolean().nullish(),
    company: z.string().nullish(),
    siret: z.string().nullish(),
    area: areaSchema.nullish(),
    partnerCompany: partnerCompanySchema.nullish(),
    createdAt: z.iso.datetime().nullish(),
  })
  .loose()
  .transform((row) => ({
    id: row.pubkey,
    user: row.user,
    hasTools: row.hasTools ?? false,
    company: row.company ?? null,
    siret: row.siret ?? null,
    area: row.area
      ? { id: row.area.pubkey, label: areaLabel(row.area.name) }
      : null,
    partnerCompany: row.partnerCompany ?? null,
    createdAt: row.createdAt ?? row.user.createdAt,
  }))

export type ProfessionalRow = z.infer<typeof professionalRowSchema>

/*
 * There is deliberately no invite/create schema here.
 *
 * `POST /v1/api/users` is multipart and requires `idNumber`, `phone`,
 * `password` and `status` on top of name/email/role, so the template's old
 * three-field invite form could only ever have worked against a mock. Creating
 * users is a separate piece of work; the UI for it was removed rather than left
 * as a button that 400s.
 */
