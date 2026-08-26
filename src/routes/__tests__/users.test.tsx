import { screen, waitFor, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ROLES } from "@/features/auth/roles"
import { currentPath, renderRoute } from "@/test/utils"

/**
 * Assertions are scoped to the table on purpose: the sidebar footer also
 * renders the signed-in user's name, so an unscoped `queryByText` would match
 * the chrome and quietly pass a test that means nothing.
 */
async function table() {
  return within(await screen.findByRole("table"))
}

/**
 * The Users section, exercised through the real route tree against MSW.
 *
 * Each segment reads a different endpoint (or a different `role` filter on the
 * same one), so the point of these is that the right rows reach the right
 * table — not that a table can render.
 */
describe("users segments", () => {
  it("redirects /users to the first segment the role may view", async () => {
    const { router } = await renderRoute("/users", { as: ROLES.SUPERADMIN })
    expect(currentPath(router)).toBe("/users/super-admins")
  })

  it("redirects /users to a different first segment for an admin", async () => {
    // An admin may not list super admins, so the landing segment differs.
    const { router } = await renderRoute("/users", { as: ROLES.ADMIN })
    expect(currentPath(router)).toBe("/users/staff")
  })

  it("lists super admins and admin developers in one table", async () => {
    await renderRoute("/users/super-admins", { as: ROLES.SUPERADMIN })

    const rows = await table()
    expect(await rows.findByText("Avery Stone")).toBeVisible()
    expect(rows.getByText("Gale Sunderland")).toBeVisible()
    // ...and nobody else. A leaked role here means the `role` param was
    // serialised in a form the backend ignores.
    expect(rows.queryByText("Frankie Osei")).toBeNull()
    expect(rows.queryByText("Blake Rivera")).toBeNull()
  })

  it("lists only admins in the admins segment", async () => {
    await renderRoute("/users/admins", { as: ROLES.SUPERADMIN })

    const rows = await table()
    expect(await rows.findByText("Frankie Osei")).toBeVisible()
    expect(rows.queryByText("Avery Stone")).toBeNull()
  })

  it("lists customers from the customers endpoint", async () => {
    await renderRoute("/users/customers", { as: ROLES.SUPERADMIN })

    const rows = await table()
    expect(await rows.findByText("Hana Aziz")).toBeVisible()
    expect(rows.getByText("Omar Haddad")).toBeVisible()
  })

  it("shows professional profile fields the plain user list lacks", async () => {
    await renderRoute("/users/professionals", { as: ROLES.SUPERADMIN })

    const rows = await table()
    expect(await rows.findByText("Yusuf Karim")).toBeVisible()
    expect(rows.getByText("Karim Maintenance")).toBeVisible()
    expect(rows.getByText("80012345600017")).toBeVisible()
  })

  it("filters by search", async () => {
    const { user } = await renderRoute("/users/customers", {
      as: ROLES.SUPERADMIN,
    })
    expect(await (await table()).findByText("Omar Haddad")).toBeVisible()

    await user.type(screen.getByRole("searchbox"), "hana")

    await waitFor(async () =>
      expect((await table()).queryByText("Omar Haddad")).toBeNull(),
    )
    expect((await table()).getByText("Hana Aziz")).toBeVisible()
  })
})

describe("row detail modal", () => {
  it("opens the modal for the clicked row", async () => {
    const { user } = await renderRoute("/users/customers", {
      as: ROLES.SUPERADMIN,
    })

    await user.click(await (await table()).findByText("Hana Aziz"))

    const modal = await screen.findByRole("dialog")
    expect(within(modal).getByText("Hana Aziz")).toBeVisible()
    // Address comes from the profile endpoint's `user.address` relation.
    expect(
      within(modal).getByText(/King Fahd Road, Al Olaya, Riyadh/),
    ).toBeVisible()
  })

  it("shows a professional's profile fields", async () => {
    const { user } = await renderRoute("/users/professionals", {
      as: ROLES.SUPERADMIN,
    })

    await user.click(await (await table()).findByText("Yusuf Karim"))

    const modal = await screen.findByRole("dialog")
    expect(within(modal).getByText("Karim Maintenance")).toBeVisible()
    expect(within(modal).getByText("80012345600017")).toBeVisible()
    expect(within(modal).getByText("Riyadh North")).toBeVisible()
  })

  it("hides the Address section when the account has none", async () => {
    // `/users` does not include the address relation at all, so an internal
    // account must show no Address section rather than an empty one.
    const { user } = await renderRoute("/users/admins", {
      as: ROLES.SUPERADMIN,
    })

    await user.click(await (await table()).findByText("Frankie Osei"))

    const modal = await screen.findByRole("dialog")
    expect(within(modal).getByText("Frankie Osei")).toBeVisible()
    expect(within(modal).queryByText("Address")).toBeNull()
  })

  /**
   * Regression: without `stopPropagation` on the action buttons, deleting a
   * user also opened their detail modal behind the confirmation dialog.
   */
  it("does not open the modal when a row action is clicked", async () => {
    const { user } = await renderRoute("/users/admins", {
      as: ROLES.SUPERADMIN,
    })
    expect(await (await table()).findByText("Frankie Osei")).toBeVisible()

    await user.click(
      screen.getByRole("button", { name: /delete frankie osei/i }),
    )

    // The confirmation is an alertdialog; the detail modal is a dialog.
    expect(await screen.findByRole("alertdialog")).toBeVisible()
    // Queried against the DOM, not the accessibility tree: the alert dialog
    // aria-hides everything else, so `queryByRole` would not see a detail
    // modal that had wrongly opened behind it.
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(0)
  })

  it("is reachable by keyboard through the row's name button", async () => {
    const { user } = await renderRoute("/users/admins", {
      as: ROLES.SUPERADMIN,
    })
    const rows = await table()
    const trigger = (await rows.findByText("Frankie Osei")).closest("button")
    expect(trigger).not.toBeNull()

    ;(trigger as HTMLButtonElement).focus()
    await user.keyboard("{Enter}")

    expect(await screen.findByRole("dialog")).toBeVisible()
  })

  it("approves a professional from the modal footer", async () => {
    const { user } = await renderRoute("/users/professionals", {
      as: ROLES.SUPERADMIN,
    })

    await user.click(await (await table()).findByText("Layla Nasser"))
    const modal = await screen.findByRole("dialog")
    await user.click(within(modal).getByRole("button", { name: /^approve$/i }))

    await waitFor(async () => {
      const row = (await table()).getByText("Layla Nasser").closest("tr")
      expect(within(row as HTMLElement).getByText("Active")).toBeVisible()
    })
  })
})

describe("professional approval", () => {
  it("approves a professional awaiting approval", async () => {
    const { user } = await renderRoute("/users/professionals", {
      as: ROLES.SUPERADMIN,
    })

    // Layla is seeded INACTIVE — registered but not yet approved.
    const row = (await (await table()).findByText("Layla Nasser")).closest("tr")
    expect(row).not.toBeNull()
    expect(
      within(row as HTMLElement).getByText(/awaiting approval/i),
    ).toBeVisible()

    await user.click(
      within(row as HTMLElement).getByRole("button", {
        name: /approve layla/i,
      }),
    )

    await waitFor(async () => {
      const updated = (await table()).getByText("Layla Nasser").closest("tr")
      expect(within(updated as HTMLElement).getByText("Active")).toBeVisible()
    })
  })
})

describe("deleting a user", () => {
  it("removes the row once confirmed", async () => {
    const { user } = await renderRoute("/users/admins", {
      as: ROLES.SUPERADMIN,
    })
    expect(await (await table()).findByText("Frankie Osei")).toBeVisible()

    await user.click(
      screen.getByRole("button", { name: /delete frankie osei/i }),
    )
    await user.click(screen.getByRole("button", { name: /^delete user$/i }))

    await waitFor(async () =>
      expect((await table()).queryByText("Frankie Osei")).toBeNull(),
    )
  })

  it("disables deleting your own account", async () => {
    await renderRoute("/users/super-admins", { as: ROLES.SUPERADMIN })
    // The signed-in account is Avery Stone (admin@acme.test).
    const row = (await (await table()).findByText("Avery Stone")).closest("tr")
    expect(
      within(row as HTMLElement).getByRole("button", {
        name: /delete avery stone/i,
      }),
    ).toBeDisabled()
  })
})
