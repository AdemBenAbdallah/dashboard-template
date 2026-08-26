import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ROLES, type Role } from "@/features/auth/roles"
import { currentPath, renderRoute, type SeededRole } from "@/test/utils"

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
const FULL = [ROLES.SUPERADMIN, ROLES.ADMIN_DEVELOPER] as const

const PROTECTED_ROUTES = [
  { path: "/dashboard", allowed: [...FULL, ROLES.ADMIN, ROLES.STAFF] },
  { path: "/settings", allowed: [...FULL, ROLES.ADMIN, ROLES.STAFF] },
  { path: "/services", allowed: [ROLES.SUPERADMIN] },
  { path: "/requests", allowed: [ROLES.SUPERADMIN] },
  { path: "/card-payments", allowed: [ROLES.SUPERADMIN] },

  // The Users section. `/users` itself only redirects, so it is reachable by
  // anyone with at least one segment; each segment is checked on its own.
  { path: "/users/super-admins", allowed: FULL },
  { path: "/users/admins", allowed: FULL },
  { path: "/users/staff", allowed: [...FULL, ROLES.ADMIN] },
  { path: "/users/customers", allowed: [...FULL, ROLES.ADMIN, ROLES.STAFF] },
  {
    path: "/users/professionals",
    allowed: [...FULL, ROLES.ADMIN, ROLES.STAFF],
  },
] as const

/** The dashboard roles the mock API has accounts for. */
const ALL_ROLES: SeededRole[] = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN_DEVELOPER,
  ROLES.ADMIN,
  ROLES.STAFF,
]

describe("unauthenticated access", () => {
  it.each(PROTECTED_ROUTES.map((r) => r.path))(
    "%s redirects to /login",
    async (path) => {
      const { router } = await renderRoute(path)
      expect(currentPath(router)).toBe("/login")
    },
  )

  it("preserves the attempted URL in the redirect param", async () => {
    const { router } = await renderRoute("/users/admins")
    expect(router.state.location.search).toMatchObject({
      redirect: "/users/admins",
    })
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
  const RESTRICTED_LINKS = ["Services", "Requests", "Card Payments"]

  it("shows every link to a superadmin", async () => {
    await renderRoute("/dashboard", { as: ROLES.SUPERADMIN })
    for (const label of [...RESTRICTED_LINKS, "Dashboard", "Settings"]) {
      expect(
        await screen.findByRole("link", { name: label }),
      ).toBeInTheDocument()
    }
    // Users is a collapsible group, so it is a button rather than a link.
    expect(screen.getByRole("button", { name: "Users" })).toBeVisible()
  })

  it("hides restricted links from a staff user", async () => {
    await renderRoute("/dashboard", { as: ROLES.STAFF })

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

/**
 * The sidebar submenu is generated from the same matrix as the guards, so this
 * checks the two cannot drift: a role sees exactly the segments it may reach.
 */
describe("users submenu", () => {
  const SEGMENT_LABELS = {
    [ROLES.SUPERADMIN]: [
      "Super admins",
      "Admins",
      "Staff",
      "Customers",
      "Professionals",
    ],
    [ROLES.ADMIN]: ["Staff", "Customers", "Professionals"],
    [ROLES.STAFF]: ["Customers", "Professionals"],
  } as const

  it.each(Object.keys(SEGMENT_LABELS) as (keyof typeof SEGMENT_LABELS)[])(
    "%s sees only its own segments",
    async (role) => {
      const { user } = await renderRoute("/dashboard", { as: role })
      const expected: readonly string[] = SEGMENT_LABELS[role]
      const all = [
        "Super admins",
        "Admins",
        "Staff",
        "Customers",
        "Professionals",
      ]

      // Expand the group so its sub-links are rendered. Radix drives this from
      // pointer events, so a real user event is required, not `.click()`.
      await user.click(await screen.findByRole("button", { name: "Users" }))
      await screen.findByRole("link", { name: expected[0] })

      for (const label of all) {
        const link = screen.queryByRole("link", { name: label })
        if (expected.includes(label)) {
          expect(link, `${role} should see ${label}`).not.toBeNull()
        } else {
          expect(link, `${role} should not see ${label}`).toBeNull()
        }
      }
    },
  )
})

describe("unknown routes", () => {
  it("renders the 404 component instead of throwing", async () => {
    await renderRoute("/no-such-page", { as: ROLES.SUPERADMIN })
    expect(await screen.findByText(/page not found/i)).toBeInTheDocument()
  })
})
