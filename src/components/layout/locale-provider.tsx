import { Direction } from "radix-ui"
import { type ReactNode, useEffect } from "react"
import { selectDir, useLocaleStore } from "@/features/locale/store"

/** Keeps `<html dir>`/`<html lang>` in sync with the locale store. */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((state) => state.locale)
  const dir = useLocaleStore(selectDir)

  useEffect(() => {
    const root = window.document.documentElement
    root.dir = dir
    root.lang = locale
  }, [dir, locale])

  // Radix primitives do not read the inherited `dir`: without a direction
  // context they assume LTR and stamp `dir="ltr"` on their own root, which
  // then overrides the document direction for everything inside them. Tabs is
  // the visible offender — it wraps the dashboard table, so the whole table
  // laid out LTR under an Arabic locale. Feeding the context here fixes every
  // Radix primitive at once instead of per-component.
  return <Direction.Provider dir={dir}>{children}</Direction.Provider>
}
