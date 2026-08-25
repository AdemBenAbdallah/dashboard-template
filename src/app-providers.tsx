import type { QueryClient } from "@tanstack/react-query"
import { QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * The app's provider tree, in one place.
 *
 * Both `App` and the test helpers mount this, so a provider missing here fails
 * in tests exactly as it would in the browser. (A missing `TooltipProvider`
 * once crashed every protected page, because `SidebarMenuButton`'s `tooltip`
 * prop renders a Radix Tooltip.)
 *
 * The QueryClient is injected rather than imported so tests can supply a fresh,
 * isolated one per test instead of sharing the app singleton.
 */
export function AppProviders({
  queryClient,
  children,
}: {
  queryClient: QueryClient
  children: ReactNode
}) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={0}>
          {children}
          {/*
            Inside the provider tree so mutation feedback is assertable in
            tests, not just visible in the browser.
          */}
          <Toaster position="bottom-right" richColors />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
