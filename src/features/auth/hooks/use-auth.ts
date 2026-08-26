import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { i18next } from "@/lib/i18n"
import { login as loginRequest, logout as logoutRequest } from "../api/auth-api"
import { DASHBOARD_ROLES, hasRole } from "../roles"
import type { LoginInput, Session } from "../schemas"
import { useAuthStore } from "../store"

/**
 * Thrown when the credentials were valid but the account has no business in
 * the dashboard. `POST /auth/signin` authenticates any active account —
 * including the customer and professional app roles — so the dashboard filters
 * on top of it. This is UX only; the backend `RolesGuard` is what actually
 * protects the data.
 */
export class DashboardAccessError extends Error {
  constructor() {
    super(i18next.t("auth.login.noDashboardAccess"))
    this.name = "DashboardAccessError"
  }
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: LoginInput): Promise<Session> => {
      const session = await loginRequest(input)
      if (!hasRole(session.user.role, DASHBOARD_ROLES)) {
        throw new DashboardAccessError()
      }
      return session
    },
    onSuccess: (session) => {
      setSession(session)
      // A previous user's cached data must never leak into the new session.
      queryClient.clear()
    },
  })
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: logoutRequest,
    // `onSettled`, not `onSuccess`: a failed logout call must still end the
    // client session.
    onSettled: async () => {
      clearSession()
      queryClient.clear()
      await navigate({ to: "/login", search: { redirect: undefined } })
    },
  })
}

/** Convenience selector for components that just need the signed-in user. */
export function useCurrentUser() {
  return useAuthStore((state) => state.user)
}
