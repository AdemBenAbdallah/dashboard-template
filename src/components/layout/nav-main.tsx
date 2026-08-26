import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronRightIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { NavItem } from "./nav-items"

export function NavMain({ items }: { items: readonly NavItem[] }) {
  const { t } = useTranslation()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) =>
            item.children?.length ? (
              <CollapsibleNavItem
                key={item.title}
                item={item}
                pathname={pathname}
              />
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={t(item.title)}>
                  <Link to={item.to} activeProps={{ "data-active": "true" }}>
                    <item.icon />
                    <span>{t(item.title)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function CollapsibleNavItem({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  const { t } = useTranslation()
  // Open when the current route is inside the group, so a deep link or a
  // reload lands with the relevant section already expanded.
  const insideGroup = pathname.startsWith(String(item.to))

  return (
    <Collapsible
      asChild
      defaultOpen={insideGroup}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={t(item.title)} data-active={insideGroup}>
            <item.icon />
            <span>{t(item.title)}</span>
            {/* Rotates on open; flipped for RTL by the logical property. */}
            <ChevronRightIcon className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180 rtl:group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => (
              <SidebarMenuSubItem key={child.title}>
                <SidebarMenuSubButton asChild>
                  <Link to={child.to} activeProps={{ "data-active": "true" }}>
                    <span>{t(child.title)}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
