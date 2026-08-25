import { z } from "zod"
import { paginatedSchema } from "@/lib/pagination"

/**
 * Placeholder shape — the real columns are not decided yet. When they are,
 * change this schema and the table in `components/card-payments-table.tsx`.
 */
export const PAYMENT_STATUSES = [
  "succeeded",
  "pending",
  "failed",
  "refunded",
] as const

export const CARD_BRANDS = ["visa", "mastercard", "amex"] as const

export const paymentStatusSchema = z.enum(PAYMENT_STATUSES)
export type PaymentStatus = z.infer<typeof paymentStatusSchema>

export const cardBrandSchema = z.enum(CARD_BRANDS)
export type CardBrand = z.infer<typeof cardBrandSchema>

export const cardPaymentSchema = z.object({
  id: z.string(),
  reference: z.string(),
  cardholder: z.string(),
  brand: cardBrandSchema,
  /** Last four digits only — never store or transport a full PAN. */
  last4: z.string().length(4),
  /** Minor units (cents), to avoid floating-point money. */
  amountMinor: z.int(),
  currency: z.string().length(3),
  status: paymentStatusSchema,
  createdAt: z.iso.datetime(),
})

export type CardPayment = z.infer<typeof cardPaymentSchema>

export const cardPaymentListSchema = paginatedSchema(cardPaymentSchema)
export type CardPaymentList = z.infer<typeof cardPaymentListSchema>

/** Formats minor units as currency for display. */
export function formatAmount(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountMinor / 100)
}
