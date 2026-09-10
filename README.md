# Approval Engine Client

React + Vite + TypeScript + Tailwind CSS v4 frontend for the Approval Engine — the centralized approver portal (inbox, request detail, decisions) plus the CRUD UI for managing applications and workflows.

## Structure

```
src/
  components/
    common/     shared, presentation-only components (StatusBadge)
    layout/     page shells (MainLayout)
    workflow/   the dynamic step editor used by the workflow form
  context/      CurrentUserContext — lightweight NIK-only login (see below)
  pages/        route-level components (Login, Inbox, RequestDetail, Workflow*, Applications)
  routes/       React Router setup (AppRouter, RequireAuth)
  services/api/ axios client + one file per API resource
  types/        shared TypeScript types (API envelope + domain shapes)
  utils/        pure helper functions (error message extraction)
e2e/            Playwright end-to-end tests (see below)
```

Auth is deliberately light: there is no SSO yet, so `CurrentUserContext` just remembers a typed-in NIK in `localStorage`. This is separate from the engine's `X-API-Key` mechanism (that authenticates a *consuming application's backend*, not a browser session) — see the service's README for why the two can't be merged.

## Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

Dev server runs on `http://localhost:5173` and proxies `/api/*` to the Go service at `http://localhost:8000` (see `vite.config.ts`). Start the service first (`Approval-Engine-Service`), then log in with any NIK — the inbox will be empty until that NIK is a registered participant with a pending assignment (see the service's `cmd/smoketest` or `POST /api/v1/participants/import`).

## End-to-end tests (Playwright)

```bash
npx playwright install chromium   # once
npm run test:e2e
```

The Go backend must already be running (`go run ./cmd/api` in `Approval-Engine-Service`, with `DATABASE_URL` set) — Playwright's `webServer` config only starts the Vite dev server, not the backend, since they're separate repos/processes.

The suite seeds its own fixture data straight against the real API (`e2e/fixtures.ts`: register an application, import participants, publish a workflow, create a request) rather than depending on manually-seeded demo data, so it's repeatable regardless of what's already in the database. Fixture ids are always uppercase, matching how the portal's login normalizes whatever NIK is typed in.

- `e2e/login.spec.ts` — NIK login, protected-route redirect, logout
- `e2e/approval-flow.spec.ts` — the core scenario: a two-step, cross-function approval (Sales → System Support) driven entirely through the UI from creation to completion, plus a rejection short-circuiting before a later step ever activates
- `e2e/workflow-crud.spec.ts` — registering an application and publishing a workflow through the dynamic step editor (including the "role" resolver, a cross-function department, and a conditional gate), then deactivating it

Tests run serially (`workers: 1`) against one shared backend/database, and `expect.timeout` is set generously (15s) because a single decision involves several sequential round trips to a remote Turso replica — not something worth optimizing away for this project's scope.
