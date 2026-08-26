import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./app"
import "@/lib/i18n"
import "./index.css"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element #root was not found in index.html")
}

/**
 * In development the mock API is started before React mounts, so no request
 * can race the service worker registration. `import.meta.env.DEV` is a literal
 * `false` in a production build, so the whole branch — and the `msw` import —
 * is dropped from the bundle.
 */
async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV) return
  if (import.meta.env.VITE_ENABLE_MOCKS === "false") return

  const { startMockServer } = await import("./mocks/browser")
  await startMockServer()
}

enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
