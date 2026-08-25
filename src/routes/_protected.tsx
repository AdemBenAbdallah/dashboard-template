import { createFileRoute, Outlet } from "@tanstack/react-router"
import type { CSSProperties } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireAuthenticated } from "@/features/auth/route-guards"

/**
 * Gating layer 1 of 3: the route guard.
 *
 * Every authenticated page is a child of this layout route, so a single
 * `beforeLoad` covers them all. Children that need a *role* add their own
 * `requireRole` check on top (see `_protected/users.tsx`).
 */
export const Route = createFileRoute("/_protected")({
  beforeLoad: requireAuthenticated,
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
