import { create } from "zustand"
import { tokenStorage } from "@/lib/token-storage"
import type { Session, User } from "./schemas"

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"

export interface AuthState {
  user: User | null
  /** Kept in memory only — never written to storage. */
  accessToken: string | null
  status: AuthStatus
  setStatus: (status: AuthStatus) => void
  /** Writes a full session after login or bootstrap. */
  setSession: (session: Session) => void
  /**
   * Updates the tokens after a silent refresh.
   *
   * `refreshToken` is optional because the backend does not rotate it — a
   * refresh returns an access token alone, and the stored refresh token must
   * survive untouched.
   */
  setTokens: (tokens: { accessToken: string; refreshToken?: string }) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  status: "idle",

  setStatus: (status) => set({ status }),

  setSession: (session) => {
    tokenStorage.setRefreshToken(session.refreshToken)
    set({
      user: session.user,
      accessToken: session.accessToken,
      status: "authenticated",
    })
  },

  setTokens: ({ accessToken, refreshToken }) => {
    if (refreshToken) tokenStorage.setRefreshToken(refreshToken)
    set({ accessToken })
  },

  clearSession: () => {
    tokenStorage.clearRefreshToken()
    set({ user: null, accessToken: null, status: "unauthenticated" })
  },
}))

/** Selector shared by the route guards and by components. */
export function selectIsAuthenticated(state: AuthState): boolean {
  return state.status === "authenticated" && state.user !== null
}
