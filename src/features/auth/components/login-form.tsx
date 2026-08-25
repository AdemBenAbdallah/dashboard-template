import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useId } from "react"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { apiErrorMessage } from "@/lib/api-error"
import { useLogin } from "../hooks/use-auth"
import { type LoginInput, loginSchema } from "../schemas"

export function LoginForm({
  onSuccess,
}: {
  onSuccess: () => void | Promise<void>
}) {
  const login = useLogin()
  const emailId = useId()
  const passwordId = useId()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = (values: LoginInput) => {
    login.mutate(values, { onSuccess })
  }

  // Field-level errors come from Zod via the resolver. This is the server's
  // answer — bad credentials, network down — shown above the submit button.
  const serverError = login.isError
    ? apiErrorMessage(login.error, "Could not sign you in. Try again.")
    : null

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={emailId}>Email</FieldLabel>
              <Input
                {...field}
                id={emailId}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={fieldState.invalid}
                disabled={login.isPending}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={passwordId}>Password</FieldLabel>
              <Input
                {...field}
                id={passwordId}
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
                disabled={login.isPending}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        {serverError ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm"
          >
            {serverError}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? (
            <>
              <Loader2Icon className="animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </FieldGroup>
    </form>
  )
}
