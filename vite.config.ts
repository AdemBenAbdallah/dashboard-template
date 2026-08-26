import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // The router plugin must run before @vitejs/plugin-react so that the
    // generated route tree is transformed by React Fast Refresh.
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      // Test files live beside the routes they exercise; they are not routes.
      routeFileIgnorePattern: "(\\.(test|spec)\\.[jt]sx?)|(__tests__)",
      quoteStyle: "double",
      semicolons: false,
    }),
    react({
      // React Compiler auto-memoizes components and hooks at build time, which
      // is what removes the need for hand-written `useMemo`/`useCallback`.
      // React 19 on its own does NOT do this — the compiler is opt-in, and
      // this flag is the opt-in. It runs through `oxc-transform-react`
      // (plugin-react v6 dropped Babel in favour of oxc).
      compiler: true,
    }),
    tailwindcss(),
  ],
  server: {
    // The backend enables URI versioning (`defaultVersion: '1'`) *and* declares
    // its controllers as `@Controller('api/...')`, so every route lives at
    // `/v1/api/...`. That `/v1` is not optional: `main.ts` mounts the Swagger
    // basic-auth guard on `/api`, which in Express also covers everything
    // beneath it — requests sent to `/api/auth/signin` are answered by the docs
    // gate with a 401 before they ever reach the controller.
    //
    // Proxying also keeps dev same-origin, so CORS never applies.
    proxy: {
      "/v1": {
        target: process.env.VITE_PROXY_TARGET ?? "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
