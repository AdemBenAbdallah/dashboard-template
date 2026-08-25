import { StatusBadge, type StatusTone } from "@/components/shared/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  type CardBrand,
  type CardPayment,
  formatAmount,
  type PaymentStatus,
} from "../schemas"

export const CARD_PAYMENT_COLUMNS = [
  "Reference",
  "Cardholder",
  "Card",
  "Amount",
  "Status",
  "Date",
] as const

const STATUS_TONE: Record<PaymentStatus, StatusTone> = {
  succeeded: "success",
  pending: "warning",
  failed: "danger",
  refunded: "neutral",
}

const STATUS_LABEL: Record<PaymentStatus, string> = {
  succeeded: "Succeeded",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
}

const BRAND_LABEL: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
}

export function CardPaymentsTable({ payments }: { payments: CardPayment[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {CARD_PAYMENT_COLUMNS.map((column) => (
              <TableHead
                key={column}
                className={column === "Amount" ? "text-right" : undefined}
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={CARD_PAYMENT_COLUMNS.length}
                className="h-24 text-center text-muted-foreground"
              >
                No card payments yet.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium font-mono text-xs">
                  {payment.reference}
                </TableCell>
                <TableCell>{payment.cardholder}</TableCell>
                <TableCell className="text-muted-foreground">
                  {BRAND_LABEL[payment.brand]} •••• {payment.last4}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatAmount(payment.amountMinor, payment.currency)}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={STATUS_TONE[payment.status]}>
                    {STATUS_LABEL[payment.status]}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(payment.createdAt).toLocaleDateString("en-US", {
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
