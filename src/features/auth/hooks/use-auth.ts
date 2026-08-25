import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { login as loginRequest, logout as logoutRequest } from "../api/auth-api"
import type { LoginInput } from "../schemas"
import { useAuthStore } from "../store"

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: LoginInput) => loginRequest(input),
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
