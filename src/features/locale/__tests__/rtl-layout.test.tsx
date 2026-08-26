import { screen } from "@testing-library/react"
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
})
