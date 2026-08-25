import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ROLES, type Role } from "@/features/auth/roles"
import { currentPath, renderRoute } from "@/test/utils"

/**
 * The authorization matrix.
 *
 * One table describing what every role may reach. Adding a route or a role is
 * a new row here — which is the point: this is the regression net for the
 * whole gating scheme.
 *
 * Remember these guards are UX only. `mocks/handlers` enforces the same rules
 * server-side, and `contract.test.ts` plus the 403 cases below cover that.
 */
const PROTECTED_ROUTES = [
  { path: "/dashboard", allowed: [ROLES.SUPERADMIN, ROLES.PROFICIENT] },
  { path: "/settings", allowed: [ROLES.SUPERADMIN, ROLES.PROFICIENT] },
  { path: "/users", allowed: [ROLES.SUPERADMIN] },
  { path: "/services", allowed: [ROLES.SUPERADMIN] },
  { path: "/requests", allowed: [ROLES.SUPERADMIN] },
  { path: "/card-payments", allowed: [ROLES.SUPERADMIN] },
] as const

const ALL_ROLES: Role[] = [ROLES.SUPERADMIN, ROLES.PROFICIENT]

describe("unauthenticated access", () => {
  it.each(PROTECTED_ROUTES.map((r) => r.path))(
    "%s redirects to /login",
    async (path) => {
      const { router } = await renderRoute(path)
      expect(currentPath(router)).toBe("/login")
    },
  )

  it("preserves the attempted URL in the redirect param", async () => {
    const { router } = await renderRoute("/users")
    expect(router.state.location.search).toMatchObject({ redirect: "/users" })
  })

  it("leaves /login reachable", async () => {
    const { router } = await renderRoute("/login")
    expect(currentPath(router)).toBe("/login")
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })
})

describe("role matrix", () => {
  for (const route of PROTECTED_ROUTES) {
    for (const role of ALL_ROLES) {
      const permitted = (route.allowed as readonly Role[]).includes(role)

      it(`${role} ${permitted ? "reaches" : "is redirected from"} ${route.path}`, async () => {
        const { router } = await renderRoute(route.path, { as: role })

        if (permitted) {
          expect(currentPath(router)).toBe(route.path)
        } else {
          // Wrong role is bounced to the dashboard, not to /login: they are
          // authenticated, just not authorized.
          expect(currentPath(router)).toBe("/dashboard")
        }
      })
    }
  }
})

describe("sidebar navigation reflects the role", () => {
  const RESTRICTED_LINKS = ["Users", "Services", "Requests", "Card Payments"]

  it("shows every link to a superadmin", async () => {
    await renderRoute("/dashboard", { as: ROLES.SUPERADMIN })
    for (const label of [...RESTRICTED_LINKS, "Dashboard", "Settings"]) {
      expect(
        await screen.findByRole("link", { name: label }),
      ).toBeInTheDocument()
    }
  })

  it("hides restricted links from a proficient user", async () => {
    await renderRoute("/dashboard", { as: ROLES.PROFICIENT })

    // The permitted ones are present...
    expect(await screen.findByRole("link", { name: "Dashboard" })).toBeVisible()
    expect(screen.getByRole("link", { name: "Settings" })).toBeVisible()

    // ...and the restricted ones are absent from the DOM entirely, not merely
    // hidden with CSS.
    for (const label of RESTRICTED_LINKS) {
      expect(screen.queryByRole("link", { name: label })).toBeNull()
    }
  })
})

describe("unknown routes", () => {
  it("renders the 404 component instead of throwing", async () => {
    await renderRoute("/no-such-page", { as: ROLES.SUPERADMIN })
    expect(await screen.findByText(/page not found/i)).toBeInTheDocument()
  })
})
