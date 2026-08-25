import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { lazy, Suspense } from "react"
import { NotFound } from "@/components/layout/not-found"
import { RouteError } from "@/components/layout/route-error"
import type { AuthState } from "@/features/auth/store"

export interface RouterContext {
  queryClient: QueryClient
  /**
   * The zustand auth store itself rather than a snapshot, so `beforeLoad`
   * always reads live state instead of a value captured at router creation.
   */
  auth: { getState: () => AuthState }
}

// Devtools are dev-only: in a production build `import.meta.env.DEV` is a
// literal `false`, so the dynamic imports below are dropped by tree shaking
// and never reach the bundle.
const Devtools = import.meta.env.DEV
  ? lazy(async () => {
      const [router, query] = await Promise.all([
        import("@tanstack/react-router-devtools"),
        import("@tanstack/react-query-devtools"),
      ])
      return {
        default: () => (
          <>
            <router.TanStackRouterDevtools position="bottom-right" />
            <query.ReactQueryDevtools initialIsOpen={false} />
          </>
        ),
      }
    })
  : () => null

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
  errorComponent: RouteError,
  notFoundComponent: NotFound,
})

function RootRoute() {
  return (
    <>
      <Outlet />
      <Suspense fallback={null}>
        <Devtools />
      </Suspense>
    </>
  )
}
