import { Link, useRouterState } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "@/features/auth/store"
import { cn } from "@/lib/utils"
import { visibleSegments } from "../segments"

/**
 * In-page segment switcher.
 *
 * The sidebar submenu is the primary navigation; this repeats it at the top of
 * the section so the current segment is obvious once the sidebar is collapsed
 * or on a narrow screen. Both read the same `visibleSegments`, so they can
 * never disagree about what a role may see.
 */
export function UserSegmentTabs() {
  const { t } = useTranslation()
  const role = useAuthStore((state) => state.user?.role ?? null)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const segments = visibleSegments(role)

  // A single reachable segment is not a choice worth rendering.
  if (segments.length < 2) return null

  return (
    <nav
      aria-label={t("users.segments.label")}
      className="flex flex-wrap gap-1 border-b"
    >
      {segments.map((segment) => {
        const active = pathname === segment.to
        return (
          <Link
            key={segment.id}
            to={segment.to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 font-medium text-sm transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t(segment.titleKey)}
          </Link>
        )
      })}
    </nav>
  )
}
