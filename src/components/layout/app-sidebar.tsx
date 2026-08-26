import { Link } from "@tanstack/react-router"
import { CommandIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { Ltr } from "@/components/shared/ltr"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { hasRole } from "@/features/auth/roles"
import { useAuthStore } from "@/features/auth/store"
import { selectDir, useLocaleStore } from "@/features/locale/store"
import { NAV_ITEMS } from "./nav-items"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const role = useAuthStore((state) => state.user?.role ?? null)
  const dir = useLocaleStore(selectDir)

  // Gating layer 2 of 3 — see the note in `nav-items.ts`. Filtering happens
  // before render, so restricted links are never in the DOM at all.
  //
  // Children are filtered too, and a group left with none is dropped: that is
  // what removes the whole Users section for a role with no segments, without
  // naming any role here.
  const items = NAV_ITEMS.filter((item) => hasRole(role, item.roles)).flatMap(
    (item) => {
      if (!item.children) return [item]
      const children = item.children.filter((child) =>
        hasRole(role, child.roles),
      )
      return children.length ? [{ ...item, children }] : []
    },
  )

  return (
    // `side` is the one piece of direction the sidebar cannot infer: its
    // fixed positioning is driven by `data-side`, not by the inherited `dir`,
    // so an RTL locale has to dock it to the right explicitly. Listed before
    // the spread so a caller can still override it.
    <Sidebar
      collapsible="offcanvas"
      side={dir === "rtl" ? "right" : "left"}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/dashboard">
                <CommandIcon className="size-5!" />
                <span className="font-semibold text-base">
                  <Ltr>Acme Inc.</Ltr>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
