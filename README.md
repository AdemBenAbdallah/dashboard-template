# Dashboard Template

A production-grade admin dashboard foundation: Vite + React + TypeScript,
TanStack Router (file-based) and Query, shadcn/ui on Tailwind v4, React Hook
Form + Zod, Axios with token refresh, Zustand for session state, and MSW for a
mock API.

Two roles ship out of the box — `superadmin` and `proficient` — gated at three
independent layers.

## Requirements

- **Node 20+** (developed on 26.3)
- **pnpm 10+** (developed on 11.18) — this project uses pnpm exclusively.
  Do not run `npm` or `npx`; use `pnpm` and `pnpm dlx`.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Then open http://localhost:5173 and sign in with one of the accounts below.

`pnpm install` may report ignored build scripts. Approve them and commit the
result — pnpm records the decision in `pnpm-workspace.yaml` under `allowBuilds`:

```bash
pnpm approve-builds
```

The MSW service worker in `public/mockServiceWorker.js` is committed. If it ever
goes missing or out of date:

```bash
pnpm exec msw init public/ --save
```

## Mock credentials

The mock API seeds four accounts. **Every account uses the password
`password123`.**

| Email             | Password      | Role         | Sees                        |
| ----------------- | ------------- | ------------ | --------------------------- |
| `admin@acme.test` | `password123` | `superadmin` | Everything                  |
| `user@acme.test`  | `password123` | `proficient` | Dashboard, Settings         |
| `casey@acme.test` | `password123` | `proficient` | Dashboard, Settings         |
| `dana@acme.test`  | `password123` | `superadmin` | Everything                  |

Sign in as `user@acme.test` to verify the guards: Services, Requests, Card
Payments and Users are all absent from the sidebar, and navigating directly to
any of those URLs redirects to `/dashboard`.

## Pages

| Route            | Roles        | Contents                                       |
| ---------------- | ------------ | ---------------------------------------------- |
| `/login`         | public       | Email + password, Zod-validated                |
| `/dashboard`     | any          | Stat cards, area chart, dashboard-01 data table |
| `/services`      | `superadmin` | Placeholder list table                         |
| `/requests`      | `superadmin` | Placeholder list table                         |
| `/card-payments` | `superadmin` | Placeholder list table                         |
| `/users`         | `superadmin` | User list, role badges, invite, delete         |
| `/settings`      | any          | Read-only account details                      |

Services, Requests and Card Payments are **placeholders**: the columns and mock
rows are invented so the pages are navigable and exercise loading, pagination
and the role guards. When the real shapes are known, edit the feature's
`schemas.ts` and its table component — everything else is inferred or generic.
They are `superadmin`-only for now; see "Changing who can see a page" below.

Mock state (invites, deletions) lives in page memory and resets on reload.

## Scripts

| Command            | What it does                                            |
| ------------------ | ------------------------------------------------------- |
| `pnpm dev`         | Dev server with MSW, router devtools and query devtools  |
| `pnpm build`       | `tsc -b` then `vite build`                              |
| `pnpm preview`     | Serve the production build                              |
| `pnpm run typecheck` | Typecheck only (`tsc -b --noEmit`)                    |
| `pnpm lint`        | Biome lint                                              |
| `pnpm format`      | Biome format, writing changes                           |
| `pnpm check`       | Biome lint + format + import sorting, writing changes   |
| `pnpm run ci`      | Biome in CI mode — checks without writing               |

### Two script gotchas

1. **Use `pnpm run ci`, not `pnpm ci`.** pnpm 11 has a built-in `ci` command
   (a frozen-lockfile install) that shadows the package script. `pnpm ci` will
   reinstall your dependencies instead of running Biome.
2. **Use `pnpm run typecheck`, not `pnpm exec tsc --noEmit`.** The root
   `tsconfig.json` is solution-style (`"files": []` plus project references), so
   a bare `tsc --noEmit` typechecks *nothing* and exits 0. The `typecheck`
   script runs `tsc -b --noEmit`, which is the real check.

## Environment

All variables are typed in `src/vite-env.d.ts`.

| Variable            | Required | Purpose                                                   |
| ------------------- | -------- | --------------------------------------------------------- |
| `VITE_API_URL`      | yes      | API base URL. `/api` in development, matched by MSW.       |
| `VITE_ENABLE_MOCKS` | no       | Set to `"false"` to run the dev server against a real API. |

MSW is loaded behind `import.meta.env.DEV` in `src/main.tsx`, so neither `msw`
nor the mock handlers appear in a production bundle. The router and query
devtools are excluded the same way.

## Folder structure

Feature-based, not type-based.

```
src/
  main.tsx                      # entry: starts MSW (dev), then mounts React
  app.tsx                       # providers + session bootstrap gate
  router.tsx                    # router instance, context, module augmentation
  routeTree.gen.ts              # generated — gitignored, Biome-ignored
  index.css                     # Tailwind v4 + shadcn theme tokens

  routes/                       # file-based routes; the URL map, nothing more
    __root.tsx                  # root route, error boundary, 404, devtools
    index.tsx                   # "/" -> redirect to /dashboard
    login.tsx                   # public
    _protected.tsx              # auth guard + sidebar shell
    _protected/
      dashboard.tsx
      services.tsx              # superadmin only
      requests.tsx              # superadmin only
      card-payments.tsx         # superadmin only
      users.tsx                 # superadmin only
      settings.tsx

  features/
    auth/
      roles.ts                  # ROLES const + Role union + hasRole()
      schemas.ts                # zod schemas; TS types inferred from them
      store.ts                  # zustand: user, accessToken, status
      route-guards.ts           # requireAuthenticated / requireRole
      api/auth-api.ts           # login, logout, me, refresh, bootstrapSession
      hooks/                    # use-auth (login/logout), use-can
      components/               # login-form, can
    dashboard/
      schemas.ts  keys.ts
      api/dashboard-api.ts      # queryOptions shared by loaders and hooks
      hooks/use-dashboard.ts
      components/               # section-cards, chart, data-table (+ skeletons)
    users/
      schemas.ts  keys.ts
      api/users-api.ts
      hooks/use-users.ts
      components/               # users-table, invite dialog, delete dialog, badge
    services/                   # placeholder list page
    requests/                   # placeholder list page
    card-payments/              # placeholder list page
      schemas.ts  keys.ts       # ^ all three follow the same four-file shape
      api/<name>-api.ts
      hooks/use-<name>.ts
      components/<name>-table.tsx

  components/
    ui/                         # vendored shadcn primitives — avoid editing
    layout/                     # app-sidebar, nav-*, site-header, theme,
                                # not-found, route-error, full-page-loader
    shared/                     # cross-feature composites: page-header,
                                # table-pagination, table-skeleton, status-badge

  lib/
    api-client.ts               # axios + auth interceptors + refresh queue
    api-error.ts                # unknown error -> user-facing message
    pagination.ts               # paginatedSchema(), PaginationParams, defaults
    query-client.ts             # QueryClient defaults
    token-storage.ts            # the only module that knows where tokens live
    utils.ts                    # cn()

  mocks/
    browser.ts                  # setupWorker + startMockServer
    db.ts                       # seed accounts, token issuing/rotation
    data/                       # chart.json, table.json, operations.ts
    handlers/                   # auth, dashboard, operations, users
```

### Conventions

- **Query keys** come from per-feature factories (`dashboardKeys.stats()`,
  `userKeys.list()`). Never inline a string array at a call site.
- **QueryClient defaults**: `staleTime: 60_000`, `retry: 1`,
  `refetchOnWindowFocus: false`.
- **Prefetching**: route `loader`s call `queryClient.ensureQueryData` with the
  same `queryOptions` object the component's `useQuery` uses, so navigating
  warms the cache instead of waterfalling on mount.
- **Validation at the boundary**: every response is parsed with a Zod schema in
  the `api/` layer, and TS types are `z.infer`red from those schemas.
- **Components stay presentational.** Data fetching lives in `hooks/`.

## Authorization

> **All client-side gating in this project is UX only.** It runs in the browser,
> on code the user controls, using a role the user's own client reports. The
> backend **must** authorize every request independently, checking the caller's
> role from the verified access token. Assume an attacker calls
> `DELETE /users/:id` directly with curl — only the server stops them.
> See the header comment in `src/features/auth/route-guards.ts`.

Three independent layers:

1. **Route** — `_protected.tsx` runs `requireAuthenticated` in `beforeLoad` and
   redirects to `/login?redirect=<attempted-url>`. Role-restricted routes add
   `requireRole(context, ALLOWED_ROLES)` and redirect to `/dashboard` on
   mismatch. Both run before the component mounts.
2. **Navigation** — `src/components/layout/nav-items.ts` gives each entry a
   `roles` array; `AppSidebar` filters the list before render, so restricted
   links never reach the DOM.
3. **Component** — `<Can role={ROLES.SUPERADMIN}>` and `useCan(role)` hide
   individual controls inside otherwise-shared pages.

The mock handlers in `src/mocks/handlers/users-handlers.ts` re-check the
caller's role on every request and return 403 — that is what the real backend
must do.

### Session and tokens

- The **access token stays in memory** (Zustand). It never touches storage.
- The **refresh token** goes to `localStorage` through `src/lib/token-storage.ts`
  — the single module that knows where it lives. Swap those three functions for
  httpOnly cookies and no call site changes.
- On a 401, the Axios response interceptor refreshes **once**. Concurrent 401s
  all await the same in-flight refresh promise and are replayed after it
  resolves; a request that has already been retried is never retried again. If
  the refresh fails, the session is cleared and the user is sent to `/login`.
- On cold load, `bootstrapSession()` exchanges the refresh token before the
  router renders, behind a full-page loader, so `/login` never flashes at a
  signed-in user. It is single-flight and cached for the page lifetime —
  refresh tokens rotate, so a second concurrent call would invalidate the first
  one's session (React StrictMode makes this reproducible in dev).

## Adding a new role

Four files, in this order:

1. **`src/features/auth/roles.ts`** — add the key to the `ROLES` const object.
   `Role`, `ROLE_VALUES` and `z.enum(ROLES)` all derive from it automatically.
   Add a label to `ROLE_LABELS` in the same file (it's a `Record<Role, string>`,
   so TypeScript will fail the build until you do).
2. **`src/features/users/components/role-badge.tsx`** — add a variant to
   `ROLE_VARIANT` (also `Record<Role, …>`, so this is compiler-enforced too) and
   pick an icon.
3. **`src/components/layout/nav-items.ts`** — add the role to the `roles` array
   of any nav entry it should see. Entries with no `roles` are visible to
   everyone.
4. **`src/mocks/db.ts`** — add a seed account with the new role so you can
   actually sign in as it, and update the credentials table above.

If a route should be restricted to the new role, also update that route's
`ALLOWED_ROLES` (see below).

## Adding a new protected route

1. Create `src/routes/_protected/<name>.tsx`. Being under `_protected` is what
   makes it require a session — no extra work.
2. Export a `Route` with `staticData: { title: "<Header title>" }`. The title
   renders in `SiteHeader`.
3. If it needs data, add a `loader` that calls
   `queryClient.ensureQueryData(<feature>Queries.<x>())` using the same
   `queryOptions` the component's hook uses.
4. Add a `NAV_ITEMS` entry in `src/components/layout/nav-items.ts` — `to` is
   typed against the generated route tree, so a typo is a compile error.
5. **To restrict it by role**, copy the pattern in
   `src/routes/_protected/users.tsx`:

   ```ts
   const ALLOWED_ROLES = [ROLES.SUPERADMIN] as const

   export const Route = createFileRoute("/_protected/reports")({
     staticData: { title: "Reports", roles: ALLOWED_ROLES },
     beforeLoad: ({ context }) => requireRole(context, ALLOWED_ROLES),
     component: ReportsPage,
   })
   ```

   Then set the same `roles` on the nav entry, and enforce it on the server.

`routeTree.gen.ts` regenerates automatically while `pnpm dev` runs (or on the
next `pnpm build`). It is gitignored and excluded from Biome.

### Adding a paginated list page

Services, Requests and Card Payments are three copies of the same shape — start
from whichever is closest:

1. `src/features/<name>/schemas.ts` — item schema, then
   `paginatedSchema(itemSchema)` for the list envelope.
2. `src/features/<name>/keys.ts` — key factory, `list(params)` keyed by the
   pagination params so each page is cached separately.
3. `src/features/<name>/api/<name>-api.ts` — a `queryOptions` factory.
4. `src/features/<name>/hooks/use-<name>.ts` — `useQuery` with
   `placeholderData: (previous) => previous` so paging doesn't flash a skeleton.
5. `src/features/<name>/components/<name>-table.tsx` — export a `*_COLUMNS`
   tuple (reused by `TableSkeleton`) and the table itself.
6. `src/mocks/handlers/operations-handlers.ts` — add a `listHandler(path, rows)`.
7. The route + nav entry, as above. `PageHeader`, `TablePagination`,
   `TableSkeleton` and `StatusBadge` in `src/components/shared/` handle the
   surrounding chrome.

### Changing who can see a page

Two places, and they must agree:

- the route's `ALLOWED_ROLES` in `src/routes/_protected/<name>.tsx`
- the `roles` array on its `NAV_ITEMS` entry

Delete both to make a page visible to every signed-in role (drop the
`beforeLoad` line too). **And change it on the server** — the mock equivalent is
the role check in `src/mocks/handlers/operations-handlers.ts`.

## Tooling notes

- **Biome only.** No ESLint, no Prettier. The current Vite `react-ts` template
  scaffolds **oxlint** rather than ESLint; it has been removed.
- **`biome.jsonc` overrides** turn off a few rules for `src/components/ui/**`
  (vendored shadcn primitives, re-fetched by `shadcn add` — editing them to
  satisfy lint would be overwritten) and turn off `nursery/useSortedClasses` for
  `src/features/dashboard/components/**`. That rule does not yet understand
  Tailwind v4 container-query variants and its autofix rewrites
  `hidden @[540px]/card:block` into `@[540px]/card:block hidden`, which flips
  the cascade and hides the element permanently. It stays on everywhere else.
- **Biome is pinned exactly** (`-E`), since new rules ship frequently and an
  unpinned bump can fail CI on unchanged code.
- **TypeScript 7** removed `baseUrl`; `paths` now resolve relative to the
  tsconfig that declares them. The shadcn Vite guide still shows `baseUrl` —
  adding it back is a hard error (`TS5102`).
- **shadcn CLI**: this project was initialised with
  `--template vite --base radix --preset nova` (Radix primitives, Lucide icons,
  Geist, neutral base color). The old `--base-color` flag no longer exists.
- The shadcn **`Form`/`FormField` components are gone**, replaced by the `Field`
  set (`Field`, `FieldLabel`, `FieldError`, `FieldGroup`) used with React Hook
  Form's `Controller` directly. See `src/features/auth/components/login-form.tsx`.
