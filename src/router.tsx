import { createRouter } from "@tanstack/react-router"
import { NotFound } from "@/components/layout/not-found"
import { RouteError } from "@/components/layout/route-error"
import type { Role } from "@/features/auth/roles"
import { useAuthStore } from "@/features/auth/store"
import { queryClient } from "@/lib/query-client"
import { routeTree } from "./routeTree.gen"

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: useAuthStore,
  },
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: NotFound,
  // Loaders read through TanStack Query, which owns caching and staleness.
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }

  /** Per-route metadata: the header title and the roles a route requires. */
  interface StaticDataRouteOption {
    title?: string
    roles?: readonly Role[]
  }
}
