import { setupServer } from "msw/node"
import { handlers } from "@/mocks/handlers"

/**
 * The test network is the *same* handler set the dev server uses.
 *
 * That means tests exercise the real axios interceptors (including the 401
 * refresh-and-replay queue) and the real Zod parsing at the API boundary.
 * Mocking axios or `fetch` directly would skip both — don't.
 *
 * Use `server.use(...)` inside a test to override a single endpoint for error
 * cases; `resetHandlers()` in `afterEach` undoes it.
 */
export const server = setupServer(...handlers)
