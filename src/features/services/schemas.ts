import { z } from "zod"
import { paginatedSchema } from "@/lib/pagination"

/**
 * Placeholder shape — the real columns are not decided yet. When they are,
 * change this schema and the table in `components/services-table.tsx`; the
 * types everywhere else are inferred from here.
 */
export const SERVICE_STATUSES = [
  "operational",
  "degraded",
  "maintenance",
  "offline",
] as const

export const serviceStatusSchema = z.enum(SERVICE_STATUSES)
export type ServiceStatus = z.infer<typeof serviceStatusSchema>

export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  status: serviceStatusSchema,
  owner: z.string(),
  updatedAt: z.iso.datetime(),
})

export type Service = z.infer<typeof serviceSchema>

export const serviceListSchema = paginatedSchema(serviceSchema)
export type ServiceList = z.infer<typeof serviceListSchema>
