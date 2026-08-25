# Testing

```bash
pnpm run test           # once
pnpm run test:watch     # watch mode
pnpm run test:coverage  # with a coverage report
```

## The principle

**Test through the route, against the real network handlers.**

Three real bugs were found in this codebase during development. None of them
would have been caught by a component unit test:

| Bug | Symptom | What catches it |
| --- | --- | --- |
| Missing `TooltipProvider` | Every protected page threw into the error boundary | Rendering any protected route with the real provider tree |
| `bootstrapSession` not single-flight | StrictMode's double effect fired two refreshes; the second 401'd on the rotated token and destroyed the session the first had just restored | `session.test.tsx` — asserts exactly one `/auth/refresh` for concurrent calls |
| `routeTree.gen.ts` gitignored | A fresh clone could not build at all | The CI job, which runs on a clean checkout |

Each has a regression test, and each was verified to **fail** when the fix is
reverted. A regression test you have never seen fail is a guess.

## Layers

**L1 — pure functions.** `*.test.ts` beside the module. Milliseconds, no DOM,
no network. `hasRole`, `safeRedirect`, `apiErrorMessage`, `pageCount`,
`tokenStorage`. `safeRedirect` is security-relevant — it is what stops
`?redirect=https://evil.example` becoming an open redirect — so it gets an
exhaustive table.

**L2 — contract.** `src/mocks/contract.test.ts`. Calls every endpoint and parses
the response with the schema the app uses. Fails the moment mock data and a
schema drift apart.

**L3 — route integration.** `src/routes/__tests__/`. The bulk of the value.
Mounts the real route tree in the real provider tree against MSW, so guards,
loaders, Zod parsing and the axios interceptors all run for real.

**L4 — E2E.** Not implemented yet. When added, keep it thin: login per role,
one RBAC denial, one mutation. It is the slowest and flakiest layer and should
not duplicate L3.

## Rules

**Never mock `axios` or `fetch`.** Mock at the network with MSW. Mocking the
client skips the refresh-and-replay queue and the Zod boundary — the two most
intricate things in the codebase. `src/test/server.ts` reuses the *same*
handlers the dev server uses.

**Query by role and accessible name.** `getByRole("button", { name: /invite/i })`,
not by class or `data-testid`. It keeps the accessibility work honest: if a
control is unreachable by role, that is a real bug.

**Reset every singleton.** `src/test/setup.ts` does this globally, and it is not
optional — the auth store, the cached bootstrap promise, the mock database and
`localStorage` are all module-level. A missing reset makes the suite
order-dependent, which is worse than no test. The mock DB reset was added after
a delete in one test made the next one fail.

**Override per test with `server.use()`.** For 403s, 500s and malformed
responses. `resetHandlers()` in `afterEach` undoes it.

**Assert the honest outcome.** When a delete 403s, assert the row is *still
there* and the user was told why — not just that a request happened.

## What not to test

- `src/components/ui/**` — vendored shadcn primitives. You would rewrite the
  tests on every `shadcn add`.
- The `dashboard-01` block's internals (drag-reorder, column visibility).
- Implementation details: that a hook memoized, that state has a given name.
- Whole-page snapshots. On a dashboard they are churn magnets that get
  regenerated without being read.

## Helpers

`src/test/utils.tsx`:

- `renderRoute(path, { as: role })` — mounts the real route tree at `path`,
  optionally signed in. Returns `{ router, queryClient, user }`.
- `signIn(role)` — authenticates through the real `/auth/login`, so the session
  holds tokens the mock API will actually accept.
- `createTestQueryClient()` — a fresh client per test with retries off. Never
  import the app singleton; a cached response would leak into the next test.
- `currentPath(router)` — the settled pathname, for guard assertions.

`src/app-providers.tsx` holds the provider tree that both `App` and the tests
mount. **Add new providers there, not in `App`** — that is what makes a missing
provider fail in CI instead of in production.

## Writing a new test

Adding a route? Add a row to `PROTECTED_ROUTES` in
`src/routes/__tests__/rbac.test.tsx`. That single table drives the whole
authorization matrix, and every role is checked against every route.

Adding a feature with an endpoint? Add its schema to the contract test, and one
integration test per user-visible behaviour — not per function.

## Environment notes

- **jsdom, not happy-dom.** happy-dom 20 crashes Node's inspector on
  `HTMLAnchorElement`, turning any unhandled `AxiosError` into an "Uncaught
  Exception" that Vitest warns can cause false positives.
- **`localStorage` is polyfilled** in `setup.ts`. Node 24+ ships an experimental
  global `localStorage` that is inert without `--localstorage-file`, and it
  shadows the DOM environment's implementation.
- **Radix and Recharts need stubs** — `ResizeObserver`, `matchMedia`,
  `scrollIntoView`, pointer capture, `scrollTo`. All in `setup.ts`.
- **MSW's artificial latency is skipped under test** (`MODE === "test"` in
  `mocks/handlers/shared.ts`). Assertions wait on state, not the clock.
- `VITE_API_URL` is set to an absolute URL in `vitest.config.ts`, not read from
  `.env` — `.env` is gitignored and would not exist in CI, and MSW's Node
  interceptor needs an origin to match against.

## Coverage

Reported for `src/features/**`, `src/lib/**` and `src/components/shared/**`.
Vendored primitives, schemas and key factories are excluded — they are
declarations, not logic. Treat coverage as a ratchet, not a gate: a number
going down is worth a conversation, a number going up is not an achievement.
