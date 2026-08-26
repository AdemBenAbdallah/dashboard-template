import { useTranslation } from "react-i18next"
import { StatusBadge, type StatusTone } from "@/components/shared/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLocaleStore } from "@/features/locale/store"
import { formatDate } from "@/lib/utils"
import type { RequestPriority, RequestStatus, ServiceRequest } from "../schemas"

export const REQUEST_COLUMN_KEYS = [
  "requests.columns.reference",
  "requests.columns.subject",
  "requests.columns.requester",
  "requests.columns.priority",
  "requests.columns.status",
  "requests.columns.created",
] as const

const STATUS_TONE: Record<RequestStatus, StatusTone> = {
  open: "info",
  in_progress: "warning",
  resolved: "success",
  closed: "neutral",
}

const STATUS_LABEL_KEY: Record<RequestStatus, string> = {
  open: "requests.status.open",
  in_progress: "requests.status.in_progress",
  resolved: "requests.status.resolved",
  closed: "requests.status.closed",
}

const PRIORITY_TONE: Record<RequestPriority, StatusTone> = {
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "danger",
}

const PRIORITY_LABEL_KEY: Record<RequestPriority, string> = {
  low: "requests.priority.low",
  medium: "requests.priority.medium",
  high: "requests.priority.high",
  urgent: "requests.priority.urgent",
}

export function RequestsTable({ requests }: { requests: ServiceRequest[] }) {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {REQUEST_COLUMN_KEYS.map((key) => (
              <TableHead key={key}>{t(key)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={REQUEST_COLUMN_KEYS.length}
                className="h-24 text-center text-muted-foreground"
              >
                {t("requests.empty")}
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium font-mono text-xs">
                  {request.reference}
                </TableCell>
                <TableCell>{request.subject}</TableCell>
                <TableCell className="text-muted-foreground">
                  {request.requester}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={PRIORITY_TONE[request.priority]}>
                    {t(PRIORITY_LABEL_KEY[request.priority])}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <StatusBadge tone={STATUS_TONE[request.status]}>
                    {t(STATUS_LABEL_KEY[request.status])}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(request.createdAt, locale)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
