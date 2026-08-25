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
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
