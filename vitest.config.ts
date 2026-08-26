import { defineConfig, mergeConfig } from "vitest/config"
import viteConfig from "./vite.config.ts"

// Merged with the app's Vite config so tests run through the exact same
// resolution, aliases and transforms as the real build — including the React
// Compiler. A separate file (rather than a `test` key in vite.config.ts) keeps
// the app config free of test-only types.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      // jsdom rather than happy-dom: happy-dom 20 crashes Node's inspector on
      // HTMLAnchorElement, which turns any unhandled AxiosError in a test into
      // an "Uncaught Exception" that Vitest warns can cause false positives.
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      // An absolute base so MSW's Node interceptor matches deterministically;
      // a relative path has no origin to resolve against outside a browser.
      // Committed here rather than in `.env`, which is gitignored and so would
      // not exist in CI.
      //
      // The `/v1/api` shape mirrors production: the Nest app uses URI
      // versioning on top of `@Controller('api/...')`, so real routes are
      // `/v1/api/auth/...`. Keeping the test base the same shape means a path
      // built here is a path that works against the real server.
      env: { VITE_API_URL: "http://localhost/v1/api" },
      environmentOptions: { jsdom: { url: "http://localhost/" } },
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      // Playwright specs live in e2e/ and are not run by Vitest.
      exclude: ["node_modules", "dist", "e2e"],
      restoreMocks: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        // Only our own code. Vendored primitives and generated files are
        // nobody's responsibility to cover.
        include: ["src/features/**", "src/lib/**", "src/components/shared/**"],
        exclude: ["**/*.test.*", "src/**/schemas.ts", "src/**/keys.ts"],
      },
    },
  }),
)
