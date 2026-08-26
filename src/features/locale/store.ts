import { create } from "zustand"
import { i18next, LOCALE_STORAGE_KEY, type Locale } from "@/lib/i18n"

export interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

/**
 * The store owns the persisted choice; i18next's own language state is a
 * mirror of it, not an independent source of truth (mirrors how
 * `theme-provider.tsx` owns `theme` and the DOM is just derived from it).
 */
export const useLocaleStore = create<LocaleState>()((set) => ({
  locale: (i18next.language as Locale) ?? "en",

  setLocale: (locale) => {
    i18next.changeLanguage(locale)
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    } catch {
      // Storage unavailable — the choice just won't persist.
    }
    set({ locale })
  },
}))

const RTL_LOCALES: readonly Locale[] = ["ar"]

export function selectDir(state: LocaleState): "ltr" | "rtl" {
  return RTL_LOCALES.includes(state.locale) ? "rtl" : "ltr"
}
