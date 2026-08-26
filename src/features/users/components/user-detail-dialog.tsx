import { CheckIcon, Trash2Icon, XIcon } from "lucide-react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Ltr } from "@/components/shared/ltr"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { User } from "@/features/auth/schemas"
import { useLocaleStore } from "@/features/locale/store"
import { formatDate } from "@/lib/utils"
import { useProfessionalApproval } from "../hooks/use-users"
import type { CustomerRow, ProfessionalRow } from "../schemas"
import { findSegment, type UserSegmentId } from "../segments"
import { AccountStatusBadge } from "./account-status-badge"
import { RoleBadge } from "./role-badge"

/**
 * The row a segment table hands over when one is clicked.
 *
 * Narrowed by the segment's `source.kind`, the same discriminator the tables
 * and the API layer use, rather than by sniffing the object's shape.
 */
export type DetailRow = User | CustomerRow | ProfessionalRow

/** Every segment's row resolves to an account; profile rows nest theirs. */
function accountOf(row: DetailRow): User {
  return "user" in row ? row.user : row
}

function asProfessional(
  row: DetailRow,
  segmentId: UserSegmentId,
): ProfessionalRow | null {
  return findSegment(segmentId).source.kind === "professionals"
    ? (row as ProfessionalRow)
    : null
}

function asCustomer(
  row: DetailRow,
  segmentId: UserSegmentId,
): CustomerRow | null {
  return findSegment(segmentId).source.kind === "customers"
    ? (row as CustomerRow)
    : null
}

interface DetailField {
  label: string
  /** `null`/`undefined`/`""` marks the field absent, not empty. */
  value: ReactNode
}

/**
 * A titled group of fields, dropped entirely when every field is absent.
 *
 * Fields are passed as data rather than as children on purpose: children are
 * React elements, never literally `null`, so a component cannot tell from them
 * whether it would render anything. The backend leaves most of these unset on a
 * self-registered account, and a section of em dashes is worse than no section.
 */
function Section({
  title,
  fields,
}: {
  title: string
  fields: readonly DetailField[]
}) {
  const present = fields.filter(
    (field) =>
      field.value !== null && field.value !== undefined && field.value !== "",
  )
  if (present.length === 0) return null

  return (
    <>
      <Separator />
      <section className="grid gap-3">
        <h3 className="font-medium text-sm">{title}</h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          {present.map((field) => (
            <div key={field.label} className="grid gap-0.5">
              <dt className="text-muted-foreground text-xs">{field.label}</dt>
              <dd className="text-sm">{field.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  )
}

/** The verification note beside a contact field, silent when unknown. */
function VerifiedNote({ verified }: { verified: boolean | null }) {
  const { t } = useTranslation()
  if (verified === null) return null

  return (
    <span className="text-muted-foreground text-xs">
      {t(
        verified ? "settings.account.verified" : "settings.account.unverified",
      )}
    </span>
  )
}

interface UserDetailDialogProps {
  row: DetailRow | null
  segmentId: UserSegmentId
  onOpenChange: (open: boolean) => void
  /** Opens the existing delete confirmation for this row. */
  onDelete: (row: DetailRow) => void
  canMutate: boolean
}

export function UserDetailDialog({
  row,
  segmentId,
  onOpenChange,
  onDelete,
  canMutate,
}: UserDetailDialogProps) {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)
  const approval = useProfessionalApproval()

  if (!row) {
    return <Dialog open={false} onOpenChange={onOpenChange} />
  }

  const user = accountOf(row)
  const professional = asProfessional(row, segmentId)
  const customer = asCustomer(row, segmentId)
  const address = user.address
  // Approval is a status transition, not a flag on the profile.
  const awaitingApproval = user.status === "INACTIVE"

  const initials =
    `${user.firstName.at(0) ?? ""}${user.lastName.at(0) ?? ""}`.trim() ||
    user.email.slice(0, 2).toUpperCase()

  return (
    <Dialog open onOpenChange={onOpenChange}>
      {/* The primitive defaults to `sm:max-w-sm`, too narrow for a field list. */}
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid gap-0.5 text-start">
              <DialogTitle>{user.name}</DialogTitle>
              <DialogDescription>
                <Ltr>{user.email}</Ltr>
              </DialogDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <RoleBadge role={user.role} />
            <AccountStatusBadge status={user.status} />
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Section
            title={t("users.detail.contact")}
            fields={[
              {
                label: t("users.columns.email"),
                value: (
                  <span className="flex items-center gap-2">
                    <Ltr>{user.email}</Ltr>
                    <VerifiedNote verified={user.isEmailVerified} />
                  </span>
                ),
              },
              {
                label: t("users.columns.phone"),
                value: user.phone ? (
                  <span className="flex items-center gap-2">
                    <Ltr>{user.phone}</Ltr>
                    <VerifiedNote verified={user.isPhoneVerified} />
                  </span>
                ) : null,
              },
            ]}
          />

          <Section
            title={t("users.detail.account")}
            fields={[
              {
                label: t("users.detail.idNumber"),
                value: user.idNumber ? <Ltr>{user.idNumber}</Ltr> : null,
              },
              {
                label: t("users.detail.birthday"),
                value: user.birthday ? formatDate(user.birthday, locale) : null,
              },
              { label: t("users.detail.locale"), value: user.locale },
              {
                label: t("users.columns.added"),
                value: user.createdAt
                  ? formatDate(user.createdAt, locale)
                  : null,
              },
              {
                label: t("settings.account.lastSignIn"),
                value: user.lastLogin
                  ? formatDate(user.lastLogin, locale)
                  : null,
              },
            ]}
          />

          <Section
            title={t("users.detail.address")}
            fields={[
              { label: t("users.detail.addressLine"), value: address?.label },
              {
                label: t("users.detail.coordinates"),
                value:
                  address?.latitude != null && address?.longitude != null ? (
                    <Ltr>{`${address.latitude}, ${address.longitude}`}</Ltr>
                  ) : null,
              },
            ]}
          />

          {professional ? (
            <Section
              title={t("users.detail.professional")}
              fields={[
                {
                  label: t("users.columns.company"),
                  value: professional.company,
                },
                {
                  label: t("users.columns.siret"),
                  value: professional.siret ? (
                    <Ltr>{professional.siret}</Ltr>
                  ) : null,
                },
                {
                  label: t("users.columns.tools"),
                  value: t(
                    professional.hasTools
                      ? "users.tools.own"
                      : "users.tools.iris",
                  ),
                },
                {
                  label: t("users.detail.area"),
                  value: professional.area?.label,
                },
                {
                  label: t("users.detail.partnerCompany"),
                  value: professional.partnerCompany?.name,
                },
              ]}
            />
          ) : null}

          {customer ? (
            <Section
              title={t("users.detail.customer")}
              fields={[
                {
                  // `Customer.note` is @Exclude'd server-side and never reaches
                  // any client, admin included — there is deliberately no note.
                  label: t("users.detail.profileId"),
                  value: <Ltr>{customer.id}</Ltr>,
                },
              ]}
            />
          ) : null}
        </div>

        <DialogFooter>
          {canMutate && professional ? (
            <Button
              variant="outline"
              disabled={approval.isPending}
              // Closing on success returns focus to the list, where the row's
              // status has just changed — the reason for opening this in the
              // first place.
              onClick={() =>
                approval.mutate(
                  { id: professional.id, approve: awaitingApproval },
                  { onSuccess: () => onOpenChange(false) },
                )
              }
            >
              {awaitingApproval ? (
                <CheckIcon className="size-4" />
              ) : (
                <XIcon className="size-4" />
              )}
              {t(
                awaitingApproval
                  ? "users.approve.approve"
                  : "users.approve.revoke",
              )}
            </Button>
          ) : null}
          {canMutate ? (
            <Button variant="destructive" onClick={() => onDelete(row)}>
              <Trash2Icon className="size-4" />
              {t("users.delete.confirm")}
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
