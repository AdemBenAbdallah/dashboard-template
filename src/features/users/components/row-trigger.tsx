import type { MouseEvent, ReactNode } from "react"

/**
 * Row-click helpers shared by the three segment tables.
 *
 * A bare clickable `<tr>` is unreachable by keyboard and invisible to a screen
 * reader, so the row click is a mouse affordance layered on top of a real
 * `<button>` in the name cell — `RowNameButton` below. The same approach the
 * dashboard's `TableCellViewer` already uses.
 */

/**
 * Wraps a row's `onClick` so it does not fire for a click that was really a
 * drag-selection, or one that came from a control inside the row.
 */
export function rowClickHandler(open: () => void) {
  return (event: MouseEvent<HTMLElement>) => {
    // Selecting an email address should not also open the row.
    if (window.getSelection()?.toString()) return
    // A click on an action button, link or input is that control's, not the
    // row's. This is the single guard: individual actions deliberately do not
    // also call `stopPropagation`, which would be a second way to say the same
    // thing and easy to forget on a new action.
    if (
      (event.target as HTMLElement).closest("button, a, input, [role=menu]")
    ) {
      return
    }
    open()
  }
}

/**
 * The keyboard-reachable trigger for a row, rendered in its first cell.
 *
 * `text-start` rather than `text-left`: the name is the first thing in the row
 * in both directions.
 */
export function RowNameButton({
  onOpen,
  children,
}: {
  onOpen: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-sm text-start hover:underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
    >
      {children}
    </button>
  )
}
