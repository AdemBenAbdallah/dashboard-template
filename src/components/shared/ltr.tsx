import type { ReactNode } from "react"

/**
 * Isolates a left-to-right run inside right-to-left copy.
 *
 * The Unicode bidi algorithm resolves *neutral* characters — `+`, `-`, `.`,
 * `/`, `@`, backticks — from the surrounding paragraph direction, not from the
 * text they belong to. Under `dir="rtl"` that pushes a leading sign or a
 * trailing period to the wrong end of the run: `+4.5%` renders as `4.5%+`,
 * `+966500000001` as `966500000001+`, and `Acme Inc.` as `.Acme Inc`.
 *
 * `<bdi dir="ltr">` opens its own isolate, so the run is laid out LTR and its
 * neutrals resolve inside it, while the element as a whole still flows with the
 * paragraph. Wrap phone numbers, signed numbers, identifiers, code fragments
 * and brand names — anything that must read the same in both locales.
 */
export function Ltr({ children }: { children: ReactNode }) {
  return <bdi dir="ltr">{children}</bdi>
}
