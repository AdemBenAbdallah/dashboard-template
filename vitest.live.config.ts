import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vitest/config"

/**
 * Live smoke tests against a running iris-backend.
 *
 * Deliberately separate from `vitest.config.ts`, which pins `VITE_API_URL` to a
 * fake origin and loads `src/test/setup.ts` — that setup starts MSW, so a test
 * run under it can never reach a real server no matter what URL it is given.
 *
 * Run with: pnpm test:live   (requires the backend on VITE_PROXY_TARGET)
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["live/**/*.live.test.ts"],
    environmentOptions: { jsdom: { url: "http://localhost/" } },
    setupFiles: ["./live/setup.ts"],
    env: {
      VITE_API_URL: `${process.env.VITE_PROXY_TARGET ?? "http://localhost:5000"}/v1/api`,
    },
    // The signin route is throttled at 10 requests / 30s, so these must not
    // race each other.
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 20_000,
  },
})
