import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Semantic tone for a status value. Each feature maps its own status union to
 * one of these, so colours stay consistent across tables without every feature
 * inventing its own palette.
 */
export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info"

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "text-muted-foreground",
  success:
    "border-emerald-600/30 text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-400",
  warning:
    "border-amber-600/30 text-amber-700 dark:border-amber-400/30 dark:text-amber-400",
  danger: "border-destructive/40 text-destructive dark:border-destructive/50",
  info: "border-sky-600/30 text-sky-700 dark:border-sky-400/30 dark:text-sky-400",
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: StatusTone
  children: ReactNode
}) {
  return (
    <Badge variant="outline" className={cn("px-1.5", TONE_CLASSES[tone])}>
      {children}
    </Badge>
  )
}
