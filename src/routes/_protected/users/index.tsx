import { createFileRoute, redirect } from "@tanstack/react-router"
import { visibleSegments } from "@/features/users/segments"

/**
 * `/users` itself renders nothing — it forwards to the first segment the
 * signed-in role may view, which differs by role. The section guard on the
 * layout has already run, so there is always at least one.
 */
export const Route = createFileRoute("/_protected/users/")({
  beforeLoad: ({ context }) => {
    const role = context.auth.getState().user?.role
    const [first] = visibleSegments(role)
    throw redirect({ to: first.to })
  },
})
