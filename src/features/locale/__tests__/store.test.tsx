import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { LocaleProvider } from "@/components/layout/locale-provider"
import { LOCALE_STORAGE_KEY } from "@/lib/i18n"
import { useLocaleStore } from "../store"

afterEach(() => {
  // The store is a module singleton — reset it so a locale change here
  // doesn't leak into the rest of the suite.
  useLocaleStore.getState().setLocale("en")
})

describe("useLocaleStore", () => {
  it("defaults to English with a left-to-right document", () => {
    expect(useLocaleStore.getState().locale).toBe("en")
  })

  it("persists a locale change to localStorage", () => {
    useLocaleStore.getState().setLocale("ar")
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("ar")
  })

  it("switches the document to rtl/ar when LocaleProvider is mounted", () => {
    render(<LocaleProvider>{null}</LocaleProvider>)

    act(() => {
      useLocaleStore.getState().setLocale("ar")
    })

    expect(document.documentElement.dir).toBe("rtl")
    expect(document.documentElement.lang).toBe("ar")
  })

  it("switches the document back to ltr/en", () => {
    render(<LocaleProvider>{null}</LocaleProvider>)

    act(() => {
      useLocaleStore.getState().setLocale("ar")
    })
    act(() => {
      useLocaleStore.getState().setLocale("en")
    })

    expect(document.documentElement.dir).toBe("ltr")
    expect(document.documentElement.lang).toBe("en")
  })
})
