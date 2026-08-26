import { useMatches } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const { t } = useTranslation()
  const matches = useMatches()

  // The deepest match that declares a title wins; see each route's
  // `staticData`. `title` is a translation key, not display text.
  const titleKey =
    matches
      .map((match) => match.staticData.title)
      .filter((value): value is string => typeof value === "string")
      .at(-1) ?? "nav.dashboard"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="font-medium text-base">{t(titleKey)}</h1>
      </div>
    </header>
  )
}
