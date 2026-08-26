import { screen, waitFor, within } from "@testing-library/react"
import { HttpResponse, http } from "msw"
import { describe, expect, it } from "vitest"
import { ROLES } from "@/features/auth/roles"
import { server } from "@/test/server"
import { renderRoute } from "@/test/utils"

/** Absolute, and pinned in vitest.config.ts — see the note there. */
const API = import.meta.env.VITE_API_URL

const LIST_PAGES = [
  {
    path: "/services",
    heading: "Services",
    firstCell: "Identity Provider",
    total: 23,
  },
  { path: "/requests", heading: "Requests", firstCell: "REQ-2400", total: 47 },
  {
    path: "/card-payments",
    heading: "Card Payments",
    firstCell: "PAY-90000",
    total: 61,
  },
] as const

describe.each(LIST_PAGES)("$heading list page", (page) => {
  it("renders a page of rows and the total", async () => {
    await renderRoute(page.path, { as: ROLES.SUPERADMIN })

    expect(
      await screen.findByRole("cell", { name: page.firstCell }),
    ).toBeVisible()
    // Header row plus the default page size.
    const rows = screen.getAllByRole("row")
    expect(rows).toHaveLength(11)
    expect(screen.getByText(`${page.total} rows`)).toBeVisible()
  })

  it("sets the header title from the route's staticData", async () => {
    await renderRoute(page.path, { as: ROLES.SUPERADMIN })
    const header = await screen.findByRole("banner")
    expect(within(header).getByRole("heading")).toHaveTextContent(page.heading)
  })

  it("pages forward without unmounting the table", async () => {
    const { user } = await renderRoute(page.path, { as: ROLES.SUPERADMIN })

    await screen.findByRole("cell", { name: page.firstCell })
    expect(screen.getByText(/page 1 of/i)).toBeVisible()

    await user.click(screen.getByRole("button", { name: /next page/i }))

    await waitFor(() => {
      expect(screen.getByText(/page 2 of/i)).toBeVisible()
    })
    // The first page's leading row is gone, so we really did page.
    expect(screen.queryByRole("cell", { name: page.firstCell })).toBeNull()
    // And a table is still on screen throughout — no skeleton swap.
    expect(screen.getByRole("table")).toBeInTheDocument()
  })

  it("disables Previous on the first page", async () => {
    await renderRoute(page.path, { as: ROLES.SUPERADMIN })
    await screen.findByRole("cell", { name: page.firstCell })
    expect(
      screen.getByRole("button", { name: /previous page/i }),
    ).toBeDisabled()
  })
})

describe("dashboard", () => {
  it("renders stat cards, the chart and the data table", async () => {
    await renderRoute("/dashboard", { as: ROLES.STAFF })

    expect(await screen.findByText("Total Revenue")).toBeVisible()
    expect(screen.getByText("Total Visitors")).toBeVisible()
    expect(screen.getByRole("table")).toBeInTheDocument()
  })

  /**
   * Regression: the dashboard hooks had no `placeholderData`, so changing page
   * emptied `data` and the whole table was replaced by its skeleton — a
   * visible layout jump.
   */
  it("keeps the table mounted while the next page loads", async () => {
    const { user } = await renderRoute("/dashboard", { as: ROLES.STAFF })

    await screen.findByRole("table")
    await user.click(screen.getByRole("button", { name: /go to next page/i }))

    // No await between the click and this assertion: if the query dropped its
    // data the table would already be gone.
    expect(screen.getByRole("table")).toBeInTheDocument()
  })
})

describe("error handling", () => {
  it("shows the route error boundary when a loader fails", async () => {
    server.use(
      http.get(`${API}/services`, () =>
        HttpResponse.json({ message: "Boom" }, { status: 500 }),
      ),
    )

    await renderRoute("/services", { as: ROLES.SUPERADMIN })
    expect(await screen.findByText(/something went wrong/i)).toBeVisible()
    expect(screen.getByRole("button", { name: /try again/i })).toBeVisible()
  })

  it("surfaces a malformed response rather than rendering garbage", async () => {
    // Zod at the boundary should reject this before it reaches a component.
    server.use(
      http.get(`${API}/services`, () =>
        HttpResponse.json({ rows: [{ id: 1 }], page: 1 }),
      ),
    )

    await renderRoute("/services", { as: ROLES.SUPERADMIN })
    expect(await screen.findByText(/something went wrong/i)).toBeVisible()
  })
})
