import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import ar from "@/locales/ar/translation.json"
import en from "@/locales/en/translation.json"

export const SUPPORTED_LOCALES = ["en", "ar"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"

export const LOCALE_STORAGE_KEY = "dashboard.locale"

function isLocale(value: string | null): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value ?? "")
}

function readStoredLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(stored)) return stored
  } catch {
    // Storage unavailable — fall through to the default.
  }
  return DEFAULT_LOCALE
}

// Resources are bundled at build time and init is synchronous — no HTTP
// backend, no browser-language detection. This is what lets the test suite
// render translated text with no `waitFor` for i18n readiness.
i18next.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: readStoredLocale(),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
  returnNull: false,
})

export { i18next }
