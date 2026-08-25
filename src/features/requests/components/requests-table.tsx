import { StatusBadge, type StatusTone } from "@/components/shared/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { RequestPriority, RequestStatus, ServiceRequest } from "../schemas"

export const REQUEST_COLUMNS = [
  "Reference",
  "Subject",
  "Requester",
  "Priority",
  "Status",
  "Created",
] as const

const STATUS_TONE: Record<RequestStatus, StatusTone> = {
  open: "info",
  in_progress: "warning",
  resolved: "success",
  closed: "neutral",
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
}

const PRIORITY_TONE: Record<RequestPriority, StatusTone> = {
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "danger",
}

const PRIORITY_LABEL: Record<RequestPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
}

export function RequestsTable({ requests }: { requests: ServiceRequest[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {REQUEST_COLUMNS.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={REQUEST_COLUMNS.length}
                className="h-24 text-center text-muted-foreground"
              >
                No requests yet.
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
                    {PRIORITY_LABEL[request.priority]}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <StatusBadge tone={STATUS_TONE[request.status]}>
                    {STATUS_LABEL[request.status]}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(request.createdAt).toLocaleDateString("en-US", {
                    dateStyle: "medium",
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
