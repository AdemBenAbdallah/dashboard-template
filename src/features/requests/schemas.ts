import { z } from "zod"
import { paginatedSchema } from "@/lib/pagination"

/**
 * Placeholder shape — the real columns are not decided yet. When they are,
 * change this schema and the table in `components/requests-table.tsx`.
 */
export const REQUEST_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
] as const

export const REQUEST_PRIORITIES = ["low", "medium", "high", "urgent"] as const

export const requestStatusSchema = z.enum(REQUEST_STATUSES)
export type RequestStatus = z.infer<typeof requestStatusSchema>

export const requestPrioritySchema = z.enum(REQUEST_PRIORITIES)
export type RequestPriority = z.infer<typeof requestPrioritySchema>

export const serviceRequestSchema = z.object({
  id: z.string(),
  reference: z.string(),
  subject: z.string(),
  requester: z.string(),
  status: requestStatusSchema,
  priority: requestPrioritySchema,
  createdAt: z.iso.datetime(),
})

/** Named `ServiceRequest` to avoid colliding with the DOM `Request` type. */
export type ServiceRequest = z.infer<typeof serviceRequestSchema>

export const requestListSchema = paginatedSchema(serviceRequestSchema)
export type RequestList = z.infer<typeof requestListSchema>
