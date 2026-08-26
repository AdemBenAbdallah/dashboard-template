import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useId, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DASHBOARD_ROLES, ROLES, roleLabel } from "@/features/auth/roles"
import { useInviteUser } from "../hooks/use-users"
import { type InviteUserInput, inviteUserSchema } from "../schemas"

export function InviteUserDialog() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const inviteUser = useInviteUser()
  const formId = useId()
  const nameId = useId()
  const emailId = useId()
  const roleId = useId()

  const form = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema()),
    defaultValues: { email: "", name: "", role: ROLES.STAFF },
  })

  const onSubmit = (values: InviteUserInput) => {
    inviteUser.mutate(values, {
      onSuccess: () => {
        form.reset()
        setOpen(false)
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          {t("users.invite.trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("users.invite.title")}</DialogTitle>
          <DialogDescription>{t("users.invite.description")}</DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={nameId}>
                    {t("users.invite.nameLabel")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={nameId}
                    placeholder={t("users.invite.namePlaceholder")}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={emailId}>
                    {t("users.invite.emailLabel")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={emailId}
                    type="email"
                    autoComplete="off"
                    placeholder={t("users.invite.emailPlaceholder")}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="role"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={roleId}>
                    {t("users.invite.roleLabel")}
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={roleId} className="w-full">
                      <SelectValue
                        placeholder={t("users.invite.rolePlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {DASHBOARD_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {roleLabel(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type="submit" form={formId} disabled={inviteUser.isPending}>
            {inviteUser.isPending
              ? t("users.invite.submitting")
              : t("users.invite.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
