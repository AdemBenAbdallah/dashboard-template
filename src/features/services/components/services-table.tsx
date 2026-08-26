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
import type { Service, ServiceStatus } from "../schemas"

export const SERVICE_COLUMN_KEYS = [
  "services.columns.service",
  "services.columns.category",
  "services.columns.status",
  "services.columns.owner",
  "services.columns.updated",
] as const

const STATUS_TONE: Record<ServiceStatus, StatusTone> = {
  operational: "success",
  degraded: "warning",
  maintenance: "info",
  offline: "danger",
}

const STATUS_LABEL_KEY: Record<ServiceStatus, string> = {
  operational: "services.status.operational",
  degraded: "services.status.degraded",
  maintenance: "services.status.maintenance",
  offline: "services.status.offline",
}

export function ServicesTable({ services }: { services: Service[] }) {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {SERVICE_COLUMN_KEYS.map((key) => (
              <TableHead key={key}>{t(key)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={SERVICE_COLUMN_KEYS.length}
                className="h-24 text-center text-muted-foreground"
              >
                {t("services.empty")}
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
                    {t(STATUS_LABEL_KEY[service.status])}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {service.owner}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(service.updatedAt, locale)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
