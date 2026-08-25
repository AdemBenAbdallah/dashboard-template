import { StatusBadge, type StatusTone } from "@/components/shared/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Service, ServiceStatus } from "../schemas"

export const SERVICE_COLUMNS = [
  "Service",
  "Category",
  "Status",
  "Owner",
  "Updated",
] as const

const STATUS_TONE: Record<ServiceStatus, StatusTone> = {
  operational: "success",
  degraded: "warning",
  maintenance: "info",
  offline: "danger",
}

const STATUS_LABEL: Record<ServiceStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  maintenance: "Maintenance",
  offline: "Offline",
}

export function ServicesTable({ services }: { services: Service[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {SERVICE_COLUMNS.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={SERVICE_COLUMNS.length}
                className="h-24 text-center text-muted-foreground"
              >
                No services yet.
              </TableCell>
            </TableRow>
          ) : (
            services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {service.category}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={STATUS_TONE[service.status]}>
                    {STATUS_LABEL[service.status]}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {service.owner}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(service.updatedAt).toLocaleDateString("en-US", {
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
