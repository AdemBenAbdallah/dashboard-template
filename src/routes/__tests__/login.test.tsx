import { screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ROLES } from "@/features/auth/roles"
import { useAuthStore } from "@/features/auth/store"
import { currentPath, renderRoute, TEST_CREDENTIALS } from "@/test/utils"

async function fillAndSubmit(
  user: ReturnType<typeof import("@testing-library/user-event").default.setup>,
  email: string,
  password: string,
) {
  await user.type(screen.getByLabelText(/email/i), email)
  await user.type(screen.getByLabelText(/password/i), password)
  await user.click(screen.getByRole("button", { name: /sign in/i }))
}

describe("login form validation", () => {
  it("rejects a malformed email and a short password before calling the API", async () => {
    const { user } = await renderRoute("/login")
    await fillAndSubmit(user, "not-an-email", "short")

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument()
    expect(
      await screen.findByText(/at least 8 characters/i),
    ).toBeInTheDocument()
    // Nothing was submitted, so no session exists.
    expect(useAuthStore.getState().user).toBeNull()
  })

  it("marks invalid fields for assistive technology", async () => {
    const { user } = await renderRoute("/login")
    await fillAndSubmit(user, "not-an-email", "short")

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toHaveAttribute(
        "aria-invalid",
        "true",
      )
    })
  })
})

describe("login submission", () => {
  it("surfaces a bad-credentials error from the server", async () => {
    const { user, router } = await renderRoute("/login")
    await fillAndSubmit(user, "admin@acme.test", "wrongpassword")

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent(/incorrect email or password/i)
    // Still on /login, still signed out.
    expect(currentPath(router)).toBe("/login")
    expect(useAuthStore.getState().user).toBeNull()
  })

  it("signs in and lands on /dashboard by default", async () => {
    const { user, router } = await renderRoute("/login")
    const { email, password } = TEST_CREDENTIALS[ROLES.SUPERADMIN]
    await fillAndSubmit(user, email, password)

    await waitFor(() => expect(currentPath(router)).toBe("/dashboard"))
    expect(useAuthStore.getState().user?.role).toBe(ROLES.SUPERADMIN)
  })

  it("honours the redirect param after signing in", async () => {
    const { user, router } = await renderRoute("/login?redirect=%2Fsettings")
    const { email, password } = TEST_CREDENTIALS[ROLES.STAFF]
    await fillAndSubmit(user, email, password)

    await waitFor(() => expect(currentPath(router)).toBe("/settings"))
  })

  /**
   * The `redirect` param is attacker-controllable via a crafted link, so the
   * off-origin case is checked here end to end as well as in the unit test for
   * `safeRedirect`.
   */
  it("ignores an off-origin redirect param", async () => {
    const { user, router } = await renderRoute(
      "/login?redirect=https%3A%2F%2Fevil.example",
    )
    const { email, password } = TEST_CREDENTIALS[ROLES.STAFF]
    await fillAndSubmit(user, email, password)

    await waitFor(() => expect(currentPath(router)).toBe("/dashboard"))
  })

  /**
   * `POST /auth/signin` authenticates any active account, the customer and
   * professional app roles included. Valid credentials are therefore not
   * enough — the role has to be one the dashboard serves.
   */
  it("refuses an account whose role has no dashboard access", async () => {
    const { user, router } = await renderRoute("/login")
    const { email, password } = TEST_CREDENTIALS[ROLES.CUSTOMER]
    await fillAndSubmit(user, email, password)

    expect(
      await screen.findByText(/doesn't have access to the dashboard/i),
    ).toBeVisible()
    expect(currentPath(router)).toBe("/login")
    // No half-established session: nothing was written to the store.
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it("redirects an already-signed-in visitor away from /login", async () => {
    const { router } = await renderRoute("/login", { as: ROLES.STAFF })
    expect(currentPath(router)).toBe("/dashboard")
  })
})
