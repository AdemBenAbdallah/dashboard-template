import { useTranslation } from "react-i18next"
import { StatusBadge, type StatusTone } from "@/components/shared/status-badge"

/**
 * `UserStatusEnum` from the backend.
 *
 * `INACTIVE` is not "switched off" — it means registered but not yet approved
 * by an administrator, which is the state every self-registered professional
 * starts in. `BLOCKED` is the post-approval revocation.
 */
export const ACCOUNT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "BLOCKED",
  "DELETED",
] as const

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

const TONE: Record<AccountStatus, StatusTone> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  BLOCKED: "danger",
  DELETED: "neutral",
}

function isAccountStatus(value: string): value is AccountStatus {
  return (ACCOUNT_STATUSES as readonly string[]).includes(value)
}

export function AccountStatusBadge({ status }: { status: string | null }) {
  const { t } = useTranslation()
  if (!status) return null

  const tone = isAccountStatus(status) ? TONE[status] : "neutral"
  const label = isAccountStatus(status)
    ? t(`users.status.${status}`)
    : // An unrecognised status is shown verbatim rather than hidden — better a
      // raw string than a row that silently looks fine.
      status

  return <StatusBadge tone={tone}>{label}</StatusBadge>
}
