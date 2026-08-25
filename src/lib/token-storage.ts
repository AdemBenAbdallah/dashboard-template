/**
 * The single place that knows *where* the refresh token lives.
 *
 * Today it is `localStorage`. To move to httpOnly cookies later, reimplement
 * these three functions (returning `null` from `get`, no-ops for `set`/`clear`)
 * and no call site changes — the axios client and the auth store only ever go
 * through this module.
 *
 * The *access* token is deliberately not stored here: it is kept in memory in
 * the auth store so it never survives a tab close.
 */
const REFRESH_TOKEN_KEY = "dashboard.refresh-token"

function safeRead(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    // Private browsing / storage disabled.
    return null
  }
}

function safeWrite(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore: the session simply won't survive a reload.
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore.
  }
}

export const tokenStorage = {
  getRefreshToken(): string | null {
    return safeRead(REFRESH_TOKEN_KEY)
  },
  setRefreshToken(token: string): void {
    safeWrite(REFRESH_TOKEN_KEY, token)
  },
  clearRefreshToken(): void {
    safeRemove(REFRESH_TOKEN_KEY)
  },
}
