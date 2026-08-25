import { createFileRoute, redirect } from "@tanstack/react-router"

/** `/` has no content of its own — the guard on `/dashboard` takes over. */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" })
  },
})
