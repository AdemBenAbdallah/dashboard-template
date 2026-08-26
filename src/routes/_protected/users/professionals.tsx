import { createFileRoute } from "@tanstack/react-router"
import { UserSegmentPage } from "@/features/users/components/user-segment-page"
import { segmentRouteOptions } from "@/features/users/route-options"

export const Route = createFileRoute("/_protected/users/professionals")({
  ...segmentRouteOptions("professionals"),
  component: () => <UserSegmentPage segmentId="professionals" />,
})
