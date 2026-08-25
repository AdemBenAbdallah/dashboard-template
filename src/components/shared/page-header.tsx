import type { ReactNode } from "react"

/** Title block shared by the list pages. `actions` sits on the right. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="font-semibold text-lg">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  )
}
