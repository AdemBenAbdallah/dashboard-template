import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterAll, afterEach, beforeAll } from "vitest"
import { resetSessionBootstrapForTests } from "@/features/auth/api/auth-api"
import { useAuthStore } from "@/features/auth/store"
import { resetMockDb } from "@/mocks/db"
import { server } from "./server"

// ---------------------------------------------------------------------------
// Browser APIs jsdom does not implement, which Radix and Recharts require.
// Without these the component under test throws before any assertion runs.
// ---------------------------------------------------------------------------

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub as never

/**
 * Node 24+ ships an experimental global `localStorage` that is inert unless
 * the process is started with `--localstorage-file`. It shadows the DOM
 * environment's own implementation, so `window.localStorage` resolves to
 * `undefined` and anything touching storage throws. `sessionStorage` is
 * unaffected.
 *
 * Methods live on the prototype so tests can spy on them.
 */
class MemoryStorage implements Storage {
  #entries = new Map<string, string>()

  get length(): number {
    return this.#entries.size
  }
  key(index: number): string | null {
    return [...this.#entries.keys()][index] ?? null
  }
  getItem(key: string): string | null {
    return this.#entries.get(key) ?? null
  }
  setItem(key: string, value: string): void {
    this.#entries.set(key, String(value))
  }
  removeItem(key: string): void {
    this.#entries.delete(key)
  }
  clear(): void {
    this.#entries.clear()
  }
}

if (!window.localStorage) {
  Object.defineProperty(window, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  })
}

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as never
}

// jsdom does not implement scrolling; the router's scrollRestoration calls it
// on every navigation and logs a "Not implemented" error otherwise.
window.scrollTo = (() => {}) as never

// Radix uses pointer capture and scrollIntoView for Select/DropdownMenu.
Element.prototype.scrollIntoView ??= function scrollIntoView() {}
Element.prototype.hasPointerCapture ??= function hasPointerCapture() {
  return false
}
Element.prototype.setPointerCapture ??= function setPointerCapture() {}
Element.prototype.releasePointerCapture ??= function releasePointerCapture() {}

// ---------------------------------------------------------------------------
// Global lifecycle
// ---------------------------------------------------------------------------

beforeAll(() => {
  // `error` (not `bypass`): an unhandled request in a test is a bug in the
  // test or a missing handler, and should be loud.
  server.listen({ onUnhandledRequest: "error" })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()

  // The auth store and the bootstrap promise are module singletons. Without
  // resetting them, state leaks between tests and the suite becomes
  // order-dependent.
  useAuthStore.setState(
    { user: null, accessToken: null, status: "idle" },
    false,
  )
  resetSessionBootstrapForTests()
  // The mock API's accounts array and token maps are mutated by invite/delete
  // and by every login, so they need restoring too.
  resetMockDb()
  window.localStorage.clear()
})

afterAll(() => {
  server.close()
})
