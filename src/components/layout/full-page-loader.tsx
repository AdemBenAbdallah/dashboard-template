import { Loader2Icon } from "lucide-react"
import { useTranslation } from "react-i18next"

/**
 * Shown while the session is being restored on a cold load, so the login page
 * never flashes for a user who is in fact signed in.
 */
export function FullPageLoader({ label }: { label?: string }) {
  const { t } = useTranslation()
  const text = label ?? t("common.loading")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3">
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground text-sm">{text}</p>
      <span className="sr-only" role="status" aria-live="polite">
        {text}
      </span>
    </div>
  )
}
