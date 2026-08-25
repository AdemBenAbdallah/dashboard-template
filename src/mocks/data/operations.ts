import type { CardPayment } from "@/features/card-payments/schemas"
import type { ServiceRequest } from "@/features/requests/schemas"
import type { Service } from "@/features/services/schemas"

/**
 * Deterministic placeholder rows for the three list pages.
 *
 * Generated rather than hand-written so the tables have enough rows to page
 * through, and deterministic so nothing flickers between reloads. Replace
 * wholesale once the real shapes are known.
 */

function isoDate(daysAgo: number): string {
  // Fixed epoch so the data never shifts between runs.
  const base = Date.UTC(2026, 5, 30)
  return new Date(base - daysAgo * 86_400_000).toISOString()
}

function pick<T>(values: readonly T[], index: number): T {
  // Non-null assertion avoided: modulo keeps the index in range.
  const value = values[index % values.length]
  if (value === undefined) throw new Error("empty pick list")
  return value
}

const SERVICE_NAMES = [
  "Identity Provider",
  "Billing Engine",
  "Notification Gateway",
  "Search Indexer",
  "Media Transcoder",
  "Audit Log",
  "Webhook Dispatcher",
  "Report Builder",
  "Rate Limiter",
  "Session Store",
  "Feature Flags",
  "Email Relay",
  "PDF Renderer",
  "Data Warehouse Sync",
  "Fraud Scoring",
  "Address Validation",
  "Currency Rates",
  "Backup Scheduler",
  "Image CDN",
  "Task Queue",
  "SMS Gateway",
  "Analytics Collector",
  "Config Service",
]

const SERVICE_CATEGORIES = [
  "Platform",
  "Payments",
  "Messaging",
  "Data",
  "Security",
]

const OWNERS = [
  "Avery Stone",
  "Blake Rivera",
  "Casey Nguyen",
  "Dana Whitfield",
  "Emery Fontaine",
]

export const SERVICES: Service[] = SERVICE_NAMES.map((name, index) => ({
  id: `svc_${String(index + 1).padStart(3, "0")}`,
  name,
  category: pick(SERVICE_CATEGORIES, index),
  status: pick(
    [
      "operational",
      "operational",
      "operational",
      "degraded",
      "maintenance",
      "offline",
    ] as const,
    index,
  ),
  owner: pick(OWNERS, index * 2),
  updatedAt: isoDate(index * 3),
}))

const REQUEST_SUBJECTS = [
  "Increase API rate limit",
  "Reset MFA device",
  "Export monthly invoices",
  "Add sandbox environment",
  "Investigate failed webhook",
  "Update billing address",
  "Grant read-only database access",
  "Restore deleted workspace",
  "Enable SSO for the team",
  "Migrate legacy API keys",
  "Custom report for Q3",
  "Whitelist a static IP",
]

export const REQUESTS: ServiceRequest[] = Array.from(
  { length: 47 },
  (_, index) => ({
    id: `req_${String(index + 1).padStart(3, "0")}`,
    reference: `REQ-${2400 + index}`,
    subject: pick(REQUEST_SUBJECTS, index),
    requester: pick(OWNERS, index),
    status: pick(
      [
        "open",
        "in_progress",
        "in_progress",
        "resolved",
        "resolved",
        "closed",
      ] as const,
      index,
    ),
    priority: pick(
      ["low", "medium", "medium", "high", "urgent"] as const,
      index,
    ),
    createdAt: isoDate(index * 2),
  }),
)

const CARDHOLDERS = [
  "Avery Stone",
  "Blake Rivera",
  "Casey Nguyen",
  "Dana Whitfield",
  "Emery Fontaine",
  "Frankie Lawson",
  "Gray Okafor",
  "Harper Diaz",
]

export const CARD_PAYMENTS: CardPayment[] = Array.from(
  { length: 61 },
  (_, index) => ({
    id: `pay_${String(index + 1).padStart(3, "0")}`,
    reference: `PAY-${90_000 + index * 7}`,
    cardholder: pick(CARDHOLDERS, index),
    brand: pick(["visa", "visa", "mastercard", "amex"] as const, index),
    last4: String(1000 + ((index * 137) % 9000)).slice(0, 4),
    amountMinor: 1_250 + ((index * 4_337) % 248_750),
    currency: "USD",
    status: pick(
      [
        "succeeded",
        "succeeded",
        "succeeded",
        "pending",
        "failed",
        "refunded",
      ] as const,
      index,
    ),
    createdAt: isoDate(index),
  }),
)
