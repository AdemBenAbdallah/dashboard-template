import {
  CheckIcon,
  EllipsisVerticalIcon,
  GlobeIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { Ltr } from "@/components/shared/ltr"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useLogout } from "@/features/auth/hooks/use-auth"
import { roleLabel } from "@/features/auth/roles"
import { useAuthStore } from "@/features/auth/store"
import { useLocaleStore } from "@/features/locale/store"
import { SUPPORTED_LOCALES } from "@/lib/i18n"
import { type Theme, useTheme } from "./theme-provider"

const THEME_OPTIONS = [
  { value: "light", labelKey: "theme.light", icon: SunIcon },
  { value: "dark", labelKey: "theme.dark", icon: MoonIcon },
  { value: "system", labelKey: "theme.system", icon: MonitorIcon },
] as const satisfies ReadonlyArray<{
  value: Theme
  labelKey: string
  icon: typeof SunIcon
}>

const LOCALE_LABEL_KEYS: Record<(typeof SUPPORTED_LOCALES)[number], string> = {
  en: "locale.en",
  ar: "locale.ar",
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

export function NavUser() {
  const { t } = useTranslation()
  const { isMobile } = useSidebar()
  const user = useAuthStore((state) => state.user)
  const { theme, setTheme } = useTheme()
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)
  const logout = useLogout()

  if (!user) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage
                  src={user.avatarUrl ?? undefined}
                  alt={user.name}
                />
                <AvatarFallback className="rounded-lg">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-muted-foreground text-xs">
                  <Ltr>{user.email}</Ltr>
                </span>
              </div>
              <EllipsisVerticalIcon className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.avatarUrl ?? undefined}
                    alt={user.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 gap-1 text-start text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <Badge variant="outline" className="w-fit px-1.5 text-xs">
                    {roleLabel(user.role)}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {t("theme.label")}
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {THEME_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => setTheme(option.value)}
                >
                  <option.icon />
                  {t(option.labelKey)}
                  {theme === option.value ? (
                    <CheckIcon className="ms-auto size-4" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {t("locale.label")}
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {SUPPORTED_LOCALES.map((value) => (
                <DropdownMenuItem key={value} onSelect={() => setLocale(value)}>
                  <GlobeIcon />
                  {t(LOCALE_LABEL_KEYS[value])}
                  {locale === value ? (
                    <CheckIcon className="ms-auto size-4" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={logout.isPending}
              onSelect={() => logout.mutate()}
            >
              <LogOutIcon />
              {logout.isPending ? t("auth.loggingOut") : t("auth.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
