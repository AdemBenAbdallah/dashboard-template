import { createFileRoute } from "@tanstack/react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useCurrentUser } from "@/features/auth/hooks/use-auth"
import { roleLabel } from "@/features/auth/roles"

export const Route = createFileRoute("/_protected/settings")({
  staticData: { title: "Settings" },
  component: SettingsPage,
})

function SettingsPage() {
  const user = useCurrentUser()

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your profile as reported by the API. Read-only in this template.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground">Name</Label>
            <p className="text-sm">{user?.name ?? "—"}</p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground">Email</Label>
            <p className="text-sm">{user?.email ?? "—"}</p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground">Role</Label>
            <p className="text-sm">{user ? roleLabel(user.role) : "—"}</p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground">Member since</Label>
            <p className="text-sm">
              {user
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    dateStyle: "medium",
                  })
                : "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Switch between light, dark and system themes from the user menu at
            the bottom of the sidebar.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
