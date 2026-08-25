import { setupWorker } from "msw/browser"
import { handlers } from "./handlers"

export const worker = setupWorker(...handlers)

/**
 * Only ever called from a `import.meta.env.DEV` branch in `main.tsx`, so this
 * module and all of `msw` are absent from the production bundle.
 */
export async function startMockServer(): Promise<void> {
  await worker.start({
    // Anything the handlers don't cover (Vite's own assets, HMR) passes through.
    onUnhandledRequest: "bypass",
    quiet: false,
    serviceWorker: { url: "/mockServiceWorker.js" },
  })
}
