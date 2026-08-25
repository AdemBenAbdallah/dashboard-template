import { Link } from "@tanstack/react-router"
import { CompassIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Rendered for any unmatched URL, and for explicit `notFound()` throws. */
export function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <CompassIcon className="size-8 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="font-semibold text-xl">Page not found</h1>
        <p className="max-w-md text-muted-foreground text-sm">
          The page you're looking for doesn't exist or you no longer have access
          to it.
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}
