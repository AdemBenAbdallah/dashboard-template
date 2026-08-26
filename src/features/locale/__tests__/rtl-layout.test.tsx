import { screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { ROLES } from "@/features/auth/roles"
import { renderRoute } from "@/test/utils"
import { useLocaleStore } from "../store"

afterEach(() => {
  // The store is a module singleton — reset it so a locale change here
  // doesn't leak into the rest of the suite.
  useLocaleStore.getState().setLocale("en")
})

/**
 * The sidebar's position comes from its `data-side` attribute, not from the
 * inherited `dir`: the fixed container is pinned with physical `left-0` /
 * `right-0`. An RTL locale therefore has to dock it explicitly, otherwise the
 * in-flow spacer lands on one edge while the fixed panel renders on the other
 * and overlaps the page content.
 */
describe("sidebar docking follows the locale direction", () => {
  it("docks to the left under an LTR locale", async () => {
    await renderRoute("/settings", { as: ROLES.SUPERADMIN })

    const sidebar = document.querySelector('[data-slot="sidebar-container"]')
    expect(sidebar).toHaveAttribute("data-side", "left")
  })

  it("docks to the right under an RTL locale", async () => {
    useLocaleStore.getState().setLocale("ar")

    await renderRoute("/settings", { as: ROLES.SUPERADMIN })

    const sidebar = document.querySelector('[data-slot="sidebar-container"]')
    expect(sidebar).toHaveAttribute("data-side", "right")
    expect(document.documentElement.dir).toBe("rtl")
  })

  it("renders the nav in Arabic under an RTL locale", async () => {
    useLocaleStore.getState().setLocale("ar")

    await renderRoute("/settings", { as: ROLES.SUPERADMIN })

    expect(
      await screen.findByRole("link", { name: "لوحة التحكم" }),
    ).toBeInTheDocument()
  })
})

/**
 * The Unicode bidi algorithm resolves neutral characters — `+`, `-`, `.`, `/`
 * — from the paragraph direction, so under `dir="rtl"` a leading sign or a
 * trailing period jumps to the far end of its run: `+966500000001` renders as
 * `966500000001+` and `Acme Inc.` as `.Acme Inc`. `<Ltr>` opens a `<bdi
 * dir="ltr">` isolate around those runs. jsdom does no bidi layout, so the
 * assertion is on the isolate being present, which is the thing that broke.
 */
describe("left-to-right runs are bidi-isolated", () => {
  it("wraps the phone number in an LTR isolate", async () => {
    useLocaleStore.getState().setLocale("ar")

    await renderRoute("/settings", { as: ROLES.SUPERADMIN })

    const phone = await screen.findByText("+966500000001")
    expect(phone.tagName).toBe("BDI")
    expect(phone).toHaveAttribute("dir", "ltr")
  })

  it("wraps the signed percentage deltas in an LTR isolate", async () => {
    useLocaleStore.getState().setLocale("ar")

    await renderRoute("/dashboard", { as: ROLES.SUPERADMIN })

    const delta = await screen.findByText("-20%")
    expect(delta.closest("bdi")).toHaveAttribute("dir", "ltr")
  })

  it("wraps a phone number in the user detail modal", async () => {
    useLocaleStore.getState().setLocale("ar")

    const { user } = await renderRoute("/users/customers", {
      as: ROLES.SUPERADMIN,
    })
    await user.click(await screen.findByText("Hana Aziz"))

    const modal = await screen.findByRole("dialog")
    const phone = within(modal).getByText("+966500000101")
    expect(phone.tagName).toBe("BDI")
    expect(phone).toHaveAttribute("dir", "ltr")
  })

  it("wraps a phone number in the users table", async () => {
    useLocaleStore.getState().setLocale("ar")

    await renderRoute("/users/super-admins", { as: ROLES.SUPERADMIN })

    // Without the isolate this renders as `966500000001+`.
    const phone = await screen.findByText("+966500000001")
    expect(phone.tagName).toBe("BDI")
    expect(phone).toHaveAttribute("dir", "ltr")
  })
})

/**
 * Tables must not pin alignment to a physical side.
 *
 * `TableHead` shipped with `text-left`, which under `dir="rtl"` pulled every
 * header to the left of its cell while the body cells followed the inherited
 * direction and sat on the right — so the Arabic headers appeared shifted a
 * column out of step with their data. jsdom does no layout, so the assertion is
 * on the logical class, which is the thing that broke.
 */
describe("table alignment is direction-agnostic", () => {
  it("aligns headers to the start, not the left", async () => {
    useLocaleStore.getState().setLocale("ar")

    await renderRoute("/users/super-admins", { as: ROLES.SUPERADMIN })

    const header = (await screen.findAllByRole("columnheader"))[0]
    expect(header.className).toContain("text-start")
    expect(header.className).not.toContain("text-left")
  })

  it("renders the table headers in Arabic", async () => {
    useLocaleStore.getState().setLocale("ar")

    await renderRoute("/users/super-admins", { as: ROLES.SUPERADMIN })

    const headers = (await screen.findAllByRole("columnheader")).map(
      (cell) => cell.textContent,
    )
    expect(headers).toContain("الاسم")
    expect(headers).toContain("البريد الإلكتروني")
  })
})

/**
 * Icons positioned inside a field must use a logical inset.
 *
 * `left-2.5` pins the search icon to the left of the box in every locale, so
 * under RTL it lands on top of the Arabic placeholder while the text padding
 * sits on the opposite side. `start-2.5` follows the direction.
 */
describe("field icons follow the locale direction", () => {
  it("positions the search icon on the logical start edge", async () => {
    useLocaleStore.getState().setLocale("ar")

    await renderRoute("/users/super-admins", { as: ROLES.SUPERADMIN })

    const search = await screen.findByRole("searchbox")
    const icon = search.parentElement?.querySelector("svg")
    expect(icon?.getAttribute("class")).toContain("start-")
    expect(icon?.getAttribute("class")).not.toMatch(/\b(left|right)-/)
    // The text padding has to move with it.
    expect(search.className).toContain("ps-8")
  })
})

/**
 * Overlay chrome must not be pinned to a physical side either.
 *
 * `DialogContent`'s close button shipped as `absolute top-2 right-2`, so under
 * an RTL locale it sat on top of the avatar in the modal's top-right corner
 * instead of moving to the free corner. The same `right-*` appeared on the
 * sheet's close button and on the select/dropdown check indicators.
 */
describe("overlay chrome follows the locale direction", () => {
  it("puts the dialog close button on the logical end edge", async () => {
    useLocaleStore.getState().setLocale("ar")

    const { user } = await renderRoute("/users/admins", {
      as: ROLES.SUPERADMIN,
    })
    await user.click(await screen.findByText("Frankie Osei"))

    const modal = await screen.findByRole("dialog")
    // The corner X, not the footer's Close button — both carry the same label.
    const close = modal.querySelector('[data-slot="dialog-close"]')
    expect(close).not.toBeNull()
    expect((close as HTMLElement).className).toContain("end-2")
    expect((close as HTMLElement).className).not.toMatch(/\bright-\d/)
  })
})

/**
 * Dates are rendered through `formatDate(value, locale)`. Omitting the second
 * argument silently falls back to English, which is easy to do and invisible
 * until someone switches locale.
 */
describe("dates follow the locale", () => {
  it("formats the users table dates in Arabic", async () => {
    useLocaleStore.getState().setLocale("ar")

    await renderRoute("/users/super-admins", { as: ROLES.SUPERADMIN })

    const table = await screen.findByRole("table")
    // `toLocaleDateString("ar", …)` yields an Arabic month name; the English
    // fallback would read "Jan"/"Feb"/…
    expect(table.textContent).not.toMatch(
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/,
    )
  })

  it("formats the detail modal dates in Arabic", async () => {
    useLocaleStore.getState().setLocale("ar")

    const { user } = await renderRoute("/users/customers", {
      as: ROLES.SUPERADMIN,
    })
    await user.click(await screen.findByText("Hana Aziz"))

    const modal = await screen.findByRole("dialog")
    expect(modal.textContent).not.toMatch(
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/,
    )
  })
})
