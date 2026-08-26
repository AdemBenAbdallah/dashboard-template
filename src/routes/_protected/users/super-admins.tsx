import { createFileRoute } from "@tanstack/react-router"
import { UserSegmentPage } from "@/features/users/components/user-segment-page"
import { segmentRouteOptions } from "@/features/users/route-options"

export const Route = createFileRoute("/_protected/users/super-admins")({
  ...segmentRouteOptions("super-admins"),
  component: () => <UserSegmentPage segmentId="super-admins" />,
})
