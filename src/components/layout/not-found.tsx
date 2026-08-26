import { Link } from "@tanstack/react-router"
import { CompassIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

/** Rendered for any unmatched URL, and for explicit `notFound()` throws. */
export function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <CompassIcon className="size-8 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="font-semibold text-xl">{t("errors.notFoundTitle")}</h1>
        <p className="max-w-md text-muted-foreground text-sm">
          {t("errors.notFoundBody")}
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard">{t("errors.backToDashboard")}</Link>
      </Button>
    </div>
  )
}
