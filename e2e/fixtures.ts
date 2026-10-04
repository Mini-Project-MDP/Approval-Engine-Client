import type { APIRequestContext } from '@playwright/test'

// Goes through the Vite dev server's proxy (see vite.config.ts), so it hits
// the same backend the UI itself talks to — no separate base URL to keep in
// sync.
const API_BASE = 'http://localhost:5173/api/v1'

// /participants/import is operator-only on the engine (X-Admin-Key). Run the
// suite with the same E2E_ADMIN_KEY as the backend's ADMIN_API_KEY.
const ADMIN_KEY = process.env.E2E_ADMIN_KEY ?? ''

let counter = 0

/**
 * A short, collision-resistant id for one test run's fixture data.
 *
 * Always uppercase: the portal's login (CurrentUserContext) uppercases
 * whatever NIK is typed in, since real NIKs are numeric and case never
 * matters for them. A mixed-case fixture id used as a user_id would silently
 * log in as a different identity than the one seeded via the API.
 */
export function uniqueId(prefix: string): string {
  counter += 1
  return `${prefix}-E2E-${Date.now()}-${counter}`.toUpperCase()
}

export interface SeededApp {
  id: string
  apiKey: string
}

export async function registerApplication(request: APIRequestContext, name: string): Promise<SeededApp> {
  const res = await request.post(`${API_BASE}/portal/applications`, {
    data: { code: uniqueId('app'), name },
  })
  const body = await res.json()
  if (!res.ok() || !body.data) {
    throw new Error(`failed to register application: ${res.status()} ${JSON.stringify(body)}`)
  }
  return { id: body.data.id, apiKey: body.data.api_key }
}

export interface SeedParticipant {
  user_id: string
  name: string
  position?: string
  department?: string
  superior_id?: string
  is_active: boolean
}

export async function importParticipants(request: APIRequestContext, participants: SeedParticipant[]): Promise<void> {
  const res = await request.post(`${API_BASE}/participants/import`, {
    data: { participants },
    headers: { 'X-Admin-Key': ADMIN_KEY },
  })
  if (!res.ok()) {
    throw new Error(`failed to import participants: ${res.status()} ${await res.text()}`)
  }
}

export interface PublishWorkflowInput {
  app_id: string
  doc_type: string
  name: string
  steps: unknown[]
}

export async function publishWorkflow(
  request: APIRequestContext,
  input: PublishWorkflowInput,
): Promise<{ id: string }> {
  const res = await request.post(`${API_BASE}/portal/workflows`, { data: input })
  const body = await res.json()
  if (!res.ok() || !body.data) {
    throw new Error(`failed to publish workflow: ${res.status()} ${JSON.stringify(body)}`)
  }
  return body.data
}

export interface CreateRequestInput {
  doc_type: string
  resource_id: string
  requester_id: string
  payload?: Record<string, unknown>
}

export async function createApprovalRequest(
  request: APIRequestContext,
  apiKey: string,
  input: CreateRequestInput,
): Promise<{ id: string }> {
  const res = await request.post(`${API_BASE}/requests`, {
    data: input,
    headers: { 'X-API-Key': apiKey },
  })
  const body = await res.json()
  if (!res.ok() || !body.data) {
    throw new Error(`failed to create request: ${res.status()} ${JSON.stringify(body)}`)
  }
  return body.data
}

/** Logs in on the portal's NIK-only login (no password, see CurrentUserContext). */
export async function loginAs(page: import('@playwright/test').Page, userId: string): Promise<void> {
  await page.goto('/login')
  await page.getByPlaceholder('NIK, mis. SS01').fill(userId)
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await page.waitForURL(/\/inbox$/)
}

/** antd Select isn't a native <select> — Playwright's selectOption() doesn't
 * apply. Its combobox does get a proper accessible name from antd Form's
 * label association, so we can still drive it by label text. Typing to
 * filter (rather than scrolling the open list) also sidesteps antd's
 * virtual-scrolling: once enough options exist, an off-screen one simply
 * isn't in the DOM for Playwright to find. */
export async function selectAntdOption(
  page: import('@playwright/test').Page,
  comboboxLabel: string,
  optionText: string,
): Promise<void> {
  const combobox = page.getByLabel(comboboxLabel, { exact: true })
  // When a Select already has a value, its visible "selection-item" label
  // can sit on top of the search input at the exact point Playwright's
  // actionability check targets. Scroll the control into view first;
  // let the option click wait for the popup's positioning and animation.
  await combobox.scrollIntoViewIfNeeded()
  await combobox.click({ force: true })
  const option = page.getByRole('option', { name: optionText, exact: true })
  await option.waitFor()
  await option.click()
}
