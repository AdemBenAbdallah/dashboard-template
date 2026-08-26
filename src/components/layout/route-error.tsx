import type { ErrorComponentProps } from "@tanstack/react-router"
import { useRouter } from "@tanstack/react-router"
import { RotateCwIcon, TriangleAlertIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

/**
 * Route-level error boundary. Attached to the root route, so any loader or
 * render failure below it lands here instead of blanking the page.
 */
export function RouteError({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const message =
    error instanceof Error ? error.message : t("errors.unexpectedError")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <TriangleAlertIcon className="size-8 text-destructive" />
      <div className="space-y-1">
        <h1 className="font-semibold text-xl">{t("errors.routeErrorTitle")}</h1>
        <p className="max-w-md text-muted-foreground text-sm">{message}</p>
      </div>
      <Button
        onClick={() => {
          reset()
          router.invalidate()
        }}
      >
        <RotateCwIcon />
        {t("errors.tryAgain")}
      </Button>
    </div>
  )
}
