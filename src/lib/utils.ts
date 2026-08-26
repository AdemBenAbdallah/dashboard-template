import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Renders an API timestamp as a medium date, or an em dash when the backend
 * has nothing to report — several `UserDto` date fields are nullable
 * (`lastLogin` on an account that has never signed in, for one).
 *
 * `locale` defaults to `"en"` for callers outside a component (or that don't
 * otherwise need to re-render on a locale change); components that render
 * this reactively should pass the active locale from `useLocaleStore`.
 * Numerals stay Western digits (`numberingSystem: "latn"`) even in Arabic.
 */
export function formatDate(
  value: string | null | undefined,
  locale = "en",
): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(locale, {
        dateStyle: "medium",
        numberingSystem: "latn",
      })
}
