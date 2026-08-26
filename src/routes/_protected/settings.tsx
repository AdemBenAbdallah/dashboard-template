import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Ltr } from "@/components/shared/ltr"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useCurrentUser } from "@/features/auth/hooks/use-auth"
import { roleLabel } from "@/features/auth/roles"
import { useLocaleStore } from "@/features/locale/store"
import { formatDate } from "@/lib/utils"

export const Route = createFileRoute("/_protected/settings")({
  staticData: { title: "nav.settings" },
  component: SettingsPage,
})

/**
 * Renders nothing when `verified` is `null` — `/auth/profile` reports no
 * verification state at all, so a restored session must stay silent rather
 * than assert the account is unverified.
 */
function VerifiedBadge({ verified }: { verified?: boolean | null }) {
  const { t } = useTranslation()
  if (verified === null || verified === undefined) return null

  return (
    <Badge
      variant={verified ? "secondary" : "outline"}
      className="align-middle"
    >
      {verified
        ? t("settings.account.verified")
        : t("settings.account.unverified")}
    </Badge>
  )
}

function SettingsPage() {
  const { t } = useTranslation()
  const user = useCurrentUser()
  const locale = useLocaleStore((state) => state.locale)
  const emptyValue = t("common.emptyValue")

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.account.title")}</CardTitle>
          <CardDescription>{t("settings.account.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground">
              {t("settings.account.name")}
            </Label>
            <p className="text-sm">{user?.name ?? emptyValue}</p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground">
              {t("settings.account.email")}
            </Label>
            <p className="text-sm">
              <Ltr>{user?.email ?? emptyValue}</Ltr>{" "}
              <VerifiedBadge verified={user?.isEmailVerified} />
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground">
              {t("settings.account.phone")}
            </Label>
            <p className="text-sm">
              <Ltr>{user?.phone || emptyValue}</Ltr>{" "}
              {user?.phone ? (
                <VerifiedBadge verified={user.isPhoneVerified} />
              ) : null}
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground">
              {t("settings.account.role")}
            </Label>
            <p className="text-sm">
              {user ? roleLabel(user.role) : emptyValue}
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground">
              {t("settings.account.memberSince")}
            </Label>
            <p className="text-sm">{formatDate(user?.createdAt, locale)}</p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground">
              {t("settings.account.lastSignIn")}
            </Label>
            <p className="text-sm">{formatDate(user?.lastLogin, locale)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appearance.title")}</CardTitle>
          <CardDescription>
            {t("settings.appearance.description")}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
