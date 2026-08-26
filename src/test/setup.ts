import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterAll, afterEach, beforeAll } from "vitest"
import { resetSessionBootstrapForTests } from "@/features/auth/api/auth-api"
import { useAuthStore } from "@/features/auth/store"
import { resetMockDb } from "@/mocks/db"
import { installMemoryStorage } from "./memory-storage"
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

installMemoryStorage()

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
