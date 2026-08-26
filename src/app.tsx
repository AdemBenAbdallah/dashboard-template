import { RouterProvider } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { FullPageLoader } from "@/components/layout/full-page-loader"
import { LocaleProvider } from "@/components/layout/locale-provider"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { bootstrapSession } from "@/features/auth/api/auth-api"
import { useAuthStore } from "@/features/auth/store"
import { setSessionExpiredHandler } from "@/lib/api-client"
import { queryClient } from "@/lib/query-client"
import { router } from "@/router"
import { AppProviders } from "./app-providers"

export function App() {
  const { t } = useTranslation()
  // `false` until the refresh-token exchange has settled. The router is not
  // mounted before then, so `_protected`'s guard never sees a half-restored
  // session and never flashes /login at a user who is actually signed in.
  const [isBootstrapped, setIsBootstrapped] = useState(false)

  useEffect(() => {
    // When a refresh finally fails mid-session, send the user to /login and
    // remember where they were.
    setSessionExpiredHandler(() => {
      router.navigate({
        to: "/login",
        search: { redirect: router.state.location.href },
      })
    })

    let cancelled = false

    bootstrapSession()
      .catch(() => null)
      .finally(() => {
        if (cancelled) return
        // No session to restore is a normal outcome, not an error.
        if (useAuthStore.getState().status === "idle") {
          useAuthStore.getState().setStatus("unauthenticated")
        }
        setIsBootstrapped(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!isBootstrapped) {
    return (
      <LocaleProvider>
        <ThemeProvider>
          <FullPageLoader label={t("common.restoringSession")} />
        </ThemeProvider>
      </LocaleProvider>
    )
  }

  return (
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
