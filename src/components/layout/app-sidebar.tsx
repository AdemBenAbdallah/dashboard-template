import { Link } from "@tanstack/react-router"
import { CommandIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { useMemo } from "react"
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
import { NAV_ITEMS } from "./nav-items"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const role = useAuthStore((state) => state.user?.role ?? null)

  // Gating layer 2 of 3 — see the note in `nav-items.ts`. Filtering happens
  // before render, so restricted links are never in the DOM at all.
  const items = useMemo(
    () => NAV_ITEMS.filter((item) => hasRole(role, item.roles)),
    [role],
  )

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/dashboard">
                <CommandIcon className="size-5!" />
                <span className="font-semibold text-base">Acme Inc.</span>
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
