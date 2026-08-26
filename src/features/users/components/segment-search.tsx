import { SearchIcon } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Search box for a segment list.
 *
 * Debounced because the backend searches on every keystroke otherwise — the
 * old dashboard fires one request per character, which is what this avoids.
 */
export function SegmentSearch({
  value,
  onChange,
  delay = 300,
}: {
  value: string
  onChange: (next: string) => void
  delay?: number
}) {
  const { t } = useTranslation()
  const inputId = useId()
  const [draft, setDraft] = useState(value)

  // Keep the box in step when the segment changes and resets the search.
  useEffect(() => setDraft(value), [value])

  useEffect(() => {
    if (draft === value) return
    const timer = setTimeout(() => onChange(draft), delay)
    return () => clearTimeout(timer)
  }, [draft, delay, onChange, value])

  return (
    <div className="relative w-full max-w-xs">
      <Label htmlFor={inputId} className="sr-only">
        {t("users.searchLabel")}
      </Label>
      {/*
        `start-2.5` and `ps-8` are logical rather than physical: under an RTL
        locale the icon moves to the right edge and the text padding follows it.
        With `left-2.5`/`pl-8` the icon would sit on the left of an Arabic field
        and overlap the text.

        The input keeps its own border and background — wrapping it in a second
        bordered container renders a visible box inside a box, which is what the
        `dark:bg-input/30` on the primitive makes obvious in dark mode.
      */}
      {/* biome-ignore lint/nursery/useSortedClasses: the sorter does not know
          Tailwind v4 logical insets and rewrites `start-2.5` to `inset-s-2.5`,
          which is not a real class. */}
      <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 size-4 text-muted-foreground start-2.5" />
      <Input
        id={inputId}
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={t("users.searchPlaceholder")}
        className="ps-8"
      />
    </div>
  )
}
