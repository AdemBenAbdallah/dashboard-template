import { QueryClient } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AppProviders } from "@/app-providers"
import { login } from "@/features/auth/api/auth-api"
import { ROLES, type Role } from "@/features/auth/roles"
import type { Session } from "@/features/auth/schemas"
import { useAuthStore } from "@/features/auth/store"
import { routeTree } from "@/routeTree.gen"

/**
 * A QueryClient per test.
 *
 * Never import the app's singleton here: a cached response would leak into the
 * next test and make the suite order-dependent. Retries are off so an expected
 * error surfaces immediately instead of after backoff.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

/** Seed credentials, mirroring `src/mocks/db.ts`. */
export const TEST_CREDENTIALS: Record<
  Role,
  { email: string; password: string }
> = {
  [ROLES.SUPERADMIN]: { email: "admin@acme.test", password: "password123" },
  [ROLES.PROFICIENT]: { email: "user@acme.test", password: "password123" },
}

/**
 * Signs in through the real `/auth/login` endpoint rather than poking the
 * store, so the session holds tokens the mock API will actually accept on
 * subsequent requests.
 */
export async function signIn(role: Role): Promise<Session> {
  const session = await login(TEST_CREDENTIALS[role])
  useAuthStore.getState().setSession(session)
  return session
}

interface RenderRouteOptions {
  /** Sign in as this role before mounting. Omit to stay anonymous. */
  as?: Role
  queryClient?: QueryClient
}

/**
 * Mounts the real route tree at `path` inside the real provider tree.
 *
 * This is the workhorse for integration tests: guards, loaders, Zod parsing and
 * the axios interceptors all run for real, against MSW.
 */
export async function renderRoute(
  path: string,
  options: RenderRouteOptions = {},
) {
  if (options.as) await signIn(options.as)

  const queryClient = options.queryClient ?? createTestQueryClient()

  const router = createRouter({
    routeTree,
    context: { queryClient, auth: useAuthStore },
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultPendingMs: 0,
  })

  const user = userEvent.setup()

  render(
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  )

  // Wait for guards and loaders to settle so assertions see the final route.
  await waitFor(() => {
    if (router.state.status !== "idle") throw new Error("router still pending")
  })

  return { router, queryClient, user }
}

/** The pathname the router settled on — the assertion target for guard tests. */
export function currentPath(router: {
  state: { location: { pathname: string } }
}): string {
  return router.state.location.pathname
}
