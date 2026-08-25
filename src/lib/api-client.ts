import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { refreshResponseSchema } from "@/features/auth/schemas"
import { useAuthStore } from "@/features/auth/store"
import { tokenStorage } from "./token-storage"

/** Endpoints that must never trigger the refresh-and-retry flow themselves. */
const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh", "/auth/logout"]

interface RetriableConfig extends InternalAxiosRequestConfig {
  /** Set once a request has already been replayed after a refresh. */
  _retry?: boolean
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
})

/**
 * Called when the session can no longer be recovered. The router registers a
 * handler here at boot; keeping it as a callback avoids importing the router
 * into the HTTP layer (which would be a cycle).
 */
let onSessionExpired: (() => void) | null = null

export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler
}

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`)
  }
  return config
})

/**
 * Single-flight refresh.
 *
 * While a refresh is in progress this holds the in-flight promise, so any
 * number of requests that 401 concurrently await the *same* refresh and are
 * then replayed — rather than each firing its own refresh call.
 */
let refreshInFlight: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  // A bare axios call, not `apiClient`: this request must not go through the
  // interceptors below, or a failing refresh would recurse.
  const response = await axios.post(
    "/auth/refresh",
    { refreshToken },
    {
      baseURL: import.meta.env.VITE_API_URL,
      headers: { "Content-Type": "application/json" },
    },
  )

  const tokens = refreshResponseSchema.parse(response.data)
  useAuthStore.getState().setTokens(tokens)
  return tokens.accessToken
}

function endSession(): void {
  useAuthStore.getState().clearSession()
  onSessionExpired?.()
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined

    const isUnauthorized = error.response?.status === 401
    const isAuthCall = AUTH_ENDPOINTS.some((path) =>
      config?.url?.includes(path),
    )

    // Only 401s on ordinary API calls are recoverable, and only once each.
    if (!config || !isUnauthorized || isAuthCall || config._retry) {
      if (isUnauthorized && (isAuthCall || config?._retry)) {
        // A retry that still 401s, or a failed refresh: the session is dead.
        if (!config?.url?.includes("/auth/login")) endSession()
      }
      return Promise.reject(error)
    }

    config._retry = true

    try {
      refreshInFlight ??= refreshAccessToken().finally(() => {
        refreshInFlight = null
      })
      const accessToken = await refreshInFlight
      config.headers.set("Authorization", `Bearer ${accessToken}`)
      return apiClient(config)
    } catch (refreshError) {
      endSession()
      return Promise.reject(refreshError)
    }
  },
)
