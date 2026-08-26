import { useTranslation } from "react-i18next"
import { Ltr } from "@/components/shared/ltr"
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
import {
  type CardBrand,
  type CardPayment,
  formatAmount,
  type PaymentStatus,
} from "../schemas"

export const CARD_PAYMENT_COLUMN_KEYS = [
  "cardPayments.columns.reference",
  "cardPayments.columns.cardholder",
  "cardPayments.columns.card",
  "cardPayments.columns.amount",
  "cardPayments.columns.status",
  "cardPayments.columns.date",
] as const

const STATUS_TONE: Record<PaymentStatus, StatusTone> = {
  succeeded: "success",
  pending: "warning",
  failed: "danger",
  refunded: "neutral",
}

const STATUS_LABEL_KEY: Record<PaymentStatus, string> = {
  succeeded: "cardPayments.status.succeeded",
  pending: "cardPayments.status.pending",
  failed: "cardPayments.status.failed",
  refunded: "cardPayments.status.refunded",
}

const BRAND_LABEL_KEY: Record<CardBrand, string> = {
  visa: "cardPayments.brand.visa",
  mastercard: "cardPayments.brand.mastercard",
  amex: "cardPayments.brand.amex",
}

export function CardPaymentsTable({ payments }: { payments: CardPayment[] }) {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {CARD_PAYMENT_COLUMN_KEYS.map((key) => (
              <TableHead
                key={key}
                className={
                  key === "cardPayments.columns.amount" ? "text-end" : undefined
                }
              >
                {t(key)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={CARD_PAYMENT_COLUMN_KEYS.length}
                className="h-24 text-center text-muted-foreground"
              >
                {t("cardPayments.empty")}
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium font-mono text-xs">
                  <Ltr>{payment.reference}</Ltr>
                </TableCell>
                <TableCell>{payment.cardholder}</TableCell>
                <TableCell className="text-muted-foreground">
                  {t(BRAND_LABEL_KEY[payment.brand])} •••• {payment.last4}
                </TableCell>
                <TableCell className="text-end tabular-nums">
                  <Ltr>
                    {formatAmount(
                      payment.amountMinor,
                      payment.currency,
                      locale,
                    )}
                  </Ltr>
                </TableCell>
                <TableCell>
                  <StatusBadge tone={STATUS_TONE[payment.status]}>
                    {t(STATUS_LABEL_KEY[payment.status])}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(payment.createdAt, locale)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
