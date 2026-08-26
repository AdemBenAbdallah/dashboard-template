import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"
import { CommandIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Ltr } from "@/components/shared/ltr"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoginForm } from "@/features/auth/components/login-form"
import { safeRedirect } from "@/features/auth/redirect"
import { selectIsAuthenticated } from "@/features/auth/store"

const searchSchema = z.object({
  /**
   * Where to land after a successful login. Written by the `_protected`
   * guard; only same-origin paths are honoured (see `safeRedirect`).
   */
  redirect: z.string().optional(),
})

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  beforeLoad: ({ context, search }) => {
    // Already signed in? Skip the form entirely.
    if (selectIsAuthenticated(context.auth.getState())) {
      throw redirect({ href: safeRedirect(search.redirect) })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const search = Route.useSearch()

  const handleSuccess = async () => {
    // `beforeLoad` guards captured the pre-login auth state; invalidate so
    // they re-run against the session that now exists.
    await router.invalidate()
    await router.navigate({ href: safeRedirect(search.redirect) })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <CommandIcon className="size-5" />
          <span className="font-semibold text-lg">
            <Ltr>Acme Inc.</Ltr>
          </span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("auth.login.title")}</CardTitle>
            <CardDescription>{t("auth.login.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
