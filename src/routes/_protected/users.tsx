import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { PageHeader } from "@/components/shared/page-header"
import { requireRole } from "@/features/auth/route-guards"
import { UserSegmentTabs } from "@/features/users/components/user-segment-tabs"
import { USERS_SECTION_ROLES } from "@/features/users/segments"

/**
 * Layout for the Users section.
 *
 * Gating layer 1 of 3, at section level: this only establishes that the role
 * may see *some* segment. Each child narrows that to its own `viewers`, so a
 * URL typed by hand is checked against the same matrix the sidebar renders.
 */
export const Route = createFileRoute("/_protected/users")({
  staticData: { title: "nav.users", roles: USERS_SECTION_ROLES },
  beforeLoad: ({ context }) => requireRole(context, USERS_SECTION_ROLES),
  component: UsersLayout,
})

function UsersLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <PageHeader
        title={t("users.heading")}
        description={t("users.description")}
      />
      <UserSegmentTabs />
      <Outlet />
    </div>
  )
}
