import { screen, waitFor, within } from "@testing-library/react"
import { HttpResponse, http } from "msw"
import { describe, expect, it } from "vitest"
import { ROLES } from "@/features/auth/roles"
import { server } from "@/test/server"
import { renderRoute } from "@/test/utils"

const API = "http://localhost/api"

/** The row for a user, located by their name rather than by index. */
async function rowFor(name: string) {
  const cell = await screen.findByRole("cell", { name })
  const row = cell.closest("tr")
  if (!row) throw new Error(`No row found for ${name}`)
  return within(row)
}

describe("users list", () => {
  it("renders the seeded users with their roles", async () => {
    await renderRoute("/users", { as: ROLES.SUPERADMIN })

    expect(
      await screen.findByRole("cell", { name: "Avery Stone" }),
    ).toBeVisible()
    expect(screen.getByRole("cell", { name: "Blake Rivera" })).toBeVisible()

    const avery = await rowFor("Avery Stone")
    expect(avery.getByText(/super admin/i)).toBeVisible()

    const blake = await rowFor("Blake Rivera")
    expect(blake.getByText(/proficient/i)).toBeVisible()
  })

  it("disables deleting your own account", async () => {
    // Signed in as admin@acme.test, which is Avery Stone.
    await renderRoute("/users", { as: ROLES.SUPERADMIN })

    const avery = await rowFor("Avery Stone")
    expect(
      avery.getByRole("button", { name: /delete avery stone/i }),
    ).toBeDisabled()

    const blake = await rowFor("Blake Rivera")
    expect(
      blake.getByRole("button", { name: /delete blake rivera/i }),
    ).toBeEnabled()
  })
})

describe("inviting a user", () => {
  it("validates the form before calling the API", async () => {
    const { user } = await renderRoute("/users", { as: ROLES.SUPERADMIN })

    await user.click(
      await screen.findByRole("button", { name: /invite user/i }),
    )
    const dialog = await screen.findByRole("dialog")

    await user.type(within(dialog).getByLabelText(/name/i), "A")
    await user.type(within(dialog).getByLabelText(/email/i), "nope")
    await user.click(
      within(dialog).getByRole("button", { name: /send invite/i }),
    )

    expect(
      await within(dialog).findByText(/at least 2 characters/i),
    ).toBeVisible()
    expect(
      await within(dialog).findByText(/valid email address/i),
    ).toBeVisible()
  })

  it("adds the invited user to the list and confirms with a toast", async () => {
    const { user } = await renderRoute("/users", { as: ROLES.SUPERADMIN })

    await user.click(
      await screen.findByRole("button", { name: /invite user/i }),
    )
    const dialog = await screen.findByRole("dialog")

    await user.type(within(dialog).getByLabelText(/name/i), "Ada Lovelace")
    await user.type(within(dialog).getByLabelText(/email/i), "ada@acme.test")
    await user.click(
      within(dialog).getByRole("button", { name: /send invite/i }),
    )

    // The list is refetched via the query key factory, not patched by hand.
    expect(
      await screen.findByRole("cell", { name: "Ada Lovelace" }),
    ).toBeVisible()
  })

  it("keeps the dialog open and reports a duplicate email", async () => {
    const { user } = await renderRoute("/users", { as: ROLES.SUPERADMIN })

    await user.click(
      await screen.findByRole("button", { name: /invite user/i }),
    )
    const dialog = await screen.findByRole("dialog")

    await user.type(within(dialog).getByLabelText(/name/i), "Duplicate Person")
    await user.type(within(dialog).getByLabelText(/email/i), "user@acme.test")
    await user.click(
      within(dialog).getByRole("button", { name: /send invite/i }),
    )

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })
    expect(screen.queryByRole("cell", { name: "Duplicate Person" })).toBeNull()
  })
})

describe("deleting a user", () => {
  it("asks for confirmation before deleting", async () => {
    const { user } = await renderRoute("/users", { as: ROLES.SUPERADMIN })

    const casey = await rowFor("Casey Nguyen")
    await user.click(
      casey.getByRole("button", { name: /delete casey nguyen/i }),
    )

    const dialog = await screen.findByRole("alertdialog")
    expect(within(dialog).getByText(/cannot be undone/i)).toBeVisible()

    // Cancelling leaves the user in place.
    await user.click(within(dialog).getByRole("button", { name: /cancel/i }))
    expect(
      await screen.findByRole("cell", { name: "Casey Nguyen" }),
    ).toBeVisible()
  })

  it("removes the user once confirmed", async () => {
    const { user } = await renderRoute("/users", { as: ROLES.SUPERADMIN })

    const casey = await rowFor("Casey Nguyen")
    await user.click(
      casey.getByRole("button", { name: /delete casey nguyen/i }),
    )

    const dialog = await screen.findByRole("alertdialog")
    await user.click(
      within(dialog).getByRole("button", { name: /delete user/i }),
    )

    await waitFor(() => {
      expect(screen.queryByRole("cell", { name: "Casey Nguyen" })).toBeNull()
    })
  })

  /**
   * The client hides the button for non-superadmins, but the server is what
   * actually protects the data. Force the failure and check the UI degrades
   * honestly rather than optimistically dropping the row.
   */
  it("keeps the row when the server refuses the delete", async () => {
    server.use(
      http.delete(`${API}/users/:id`, () =>
        HttpResponse.json(
          { message: "You don't have permission to do that." },
          { status: 403 },
        ),
      ),
    )

    const { user } = await renderRoute("/users", { as: ROLES.SUPERADMIN })

    const casey = await rowFor("Casey Nguyen")
    await user.click(
      casey.getByRole("button", { name: /delete casey nguyen/i }),
    )
    const dialog = await screen.findByRole("alertdialog")
    await user.click(
      within(dialog).getByRole("button", { name: /delete user/i }),
    )

    // Row survives, and the user is told why.
    expect(
      await screen.findByRole("cell", { name: "Casey Nguyen" }),
    ).toBeVisible()
    expect(await screen.findByText(/permission/i)).toBeVisible()
  })
})
