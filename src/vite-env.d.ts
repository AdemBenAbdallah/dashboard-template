/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the REST API. `/v1/api` in development (see the Vite proxy). */
  readonly VITE_API_URL: string
  /** `"true"` to boot the MSW mock API. Ignored outside development. */
  readonly VITE_ENABLE_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
