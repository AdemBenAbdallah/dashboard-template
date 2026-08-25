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
/**
 * Vitest runs with `DEV === true`, and the integration tests query the DOM by
 * role — a devtools trigger button would be avoidable noise in those queries.
 */
const SHOW_DEVTOOLS = import.meta.env.DEV && import.meta.env.MODE !== "test"

/**
 * Router and Query devtools share one trigger, as tabs inside the TanStack
 * Devtools shell, instead of each rendering its own floating widget.
 *
 * In a production build `import.meta.env.DEV` is the literal `false`, so this
 * whole branch — and every devtools package with it — is dropped by tree
 * shaking and never reaches the bundle.
 */
const Devtools = SHOW_DEVTOOLS
  ? lazy(async () => {
      const [shell, router, query] = await Promise.all([
        import("@tanstack/react-devtools"),
        import("@tanstack/react-router-devtools"),
        import("@tanstack/react-query-devtools"),
      ])
      return {
        default: () => (
          <shell.TanStackDevtools
            // Anchored rather than the shell's draggable default, so the
            // button stays put. Bottom-*right*: bottom-left is occupied by the
            // sidebar's user menu, which the trigger sat directly on top of.
            config={{ position: "bottom-right", triggerMode: "fixed" }}
            plugins={[
              {
                id: "tanstack-router",
                name: "Router",
                // Without this the shell opens on an empty "No plugin open"
                // screen and every session starts with an extra click.
                defaultOpen: true,
                render: <router.TanStackRouterDevtoolsPanel />,
              },
              {
                id: "tanstack-query",
                name: "Query",
                // Fill the shell frame; the panel is 500px tall by default.
                render: (
                  <query.ReactQueryDevtoolsPanel style={{ height: "100%" }} />
                ),
              },
            ]}
          />
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
