import { expect, test } from '@playwright/test'
import type { InboxItem } from '../src/types/domain'

const items: InboxItem[] = [
  { resource: 'PO-2026-001', type: 'purchase_order', requester: 'SA01', created: '2026-09-01 08:00:00' },
  { resource: 'EXP-2026-002', type: 'expense', requester: 'FN02', created: '2026-09-02 08:00:00' },
].map((entry, index) => ({
  assignment: { id: `assignment-${index}`, step_id: `step-${index}`, request_id: `request-${index}`, user_id: 'UX01', status: 'pending' },
  request: { id: `request-${index}`, app_id: 'assetmgmt', definition_id: 'workflow-1', doc_type: entry.type, resource_id: entry.resource, requester_id: entry.requester, payload: { amount: 1000000 }, status: 'pending', current_step_order: 1, created_at: entry.created },
  step_name: 'Supervisor Approval', total_steps: 2,
}))

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('approval-engine.current_user_id', 'UX01'))
})

test('search and document filter combine, clear, and open a request with the keyboard', async ({ page }) => {
  await page.route('**/api/v1/inbox/*', (route) => route.fulfill({ json: { data: items } }))
  await page.route('**/api/v1/requests/request-0', (route) => route.fulfill({ json: { data: items[0].request } }))
  await page.goto('/inbox')
  await expect(page.getByRole('status')).toHaveText('2 dari 2 permintaan')
  await page.getByLabel('Cari permintaan').fill('sa01')
  await expect(page.getByRole('status')).toHaveText('1 dari 2 permintaan')
  await page.getByLabel('Jenis dokumen').click()
  await page.getByTitle('expense', { exact: true }).click()
  await expect(page.getByText('Tidak ada hasil yang sesuai')).toBeVisible()
  await page.getByRole('button', { name: 'Hapus filter' }).click()
  await expect(page.getByRole('status')).toHaveText('2 dari 2 permintaan')
  const review = page.getByRole('link', { name: 'Tinjau PO-2026-001' })
  await review.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/requests\/request-0$/)
  await page.getByRole('link', { name: 'Kembali ke kotak masuk' }).click()
  await expect(page).toHaveURL(/\/inbox$/)
})

test('failed inbox loading can be retried and empty guidance remains available', async ({ page }) => {
  let unavailable = true
  await page.route('**/api/v1/inbox/*', (route) => {
    return unavailable ? route.fulfill({ status: 503, json: { message: 'Layanan tidak tersedia' } }) : route.fulfill({ json: { data: [] } })
  })
  await page.goto('/inbox')
  await expect(page.getByText('Permintaan belum dapat dimuat')).toBeVisible()
  unavailable = false
  await page.getByRole('button', { name: 'Muat ulang' }).click()
  await expect(page.getByText('Tidak ada permintaan yang menunggu')).toBeVisible()
  await expect(page.getByText('Permintaan belum dapat dimuat')).toHaveCount(0)
  const guide = page.locator('.inbox-guide')
  await guide.locator('summary').click()
  await expect(guide).not.toHaveAttribute('open')
  await page.reload()
  await expect(guide).not.toHaveAttribute('open')
  await guide.locator('summary').click()
  await expect(guide).toHaveAttribute('open')
})

test('mobile navigation overlays content, closes after navigation, and fits the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.route('**/api/v1/inbox/*', (route) => route.fulfill({ json: { data: items } }))
  await page.route('**/api/v1/workflows', (route) => route.fulfill({ json: { data: [] } }))
  await page.route('**/api/v1/applications', (route) => route.fulfill({ json: { data: [] } }))
  await page.goto('/inbox')
  await expect(page.getByRole('status')).toHaveText('2 dari 2 permintaan')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const review = page.getByRole('link', { name: 'Tinjau PO-2026-001' })
  await review.scrollIntoViewIfNeeded()
  await expect(review).toBeInViewport()
  await page.getByRole('button', { name: 'Buka navigasi' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByRole('button', { name: 'Buka navigasi' }).click()
  await page.getByRole('menuitem', { name: 'Workflow' }).click()
  await expect(page).toHaveURL(/\/workflows$/)
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('heading', { name: 'Workflow', exact: true })).toBeVisible()
})

test('direct workflow form loads retain component styling and visible field labels', async ({ page }) => {
  await page.route('**/api/v1/applications', (route) => route.fulfill({ json: { data: [{ id: 'app-1', code: 'asset', name: 'Asset Management', is_active: true }] } }))
  await page.goto('/workflows/new')
  await expect(page.getByLabel('Nama workflow')).toBeVisible()
  await expect(page.locator('.ant-card-body').first()).toHaveCSS('padding', '24px')
  await expect(page.getByLabel('Nama workflow')).toHaveCSS('border-top-width', '1px')
  await expect(page.getByLabel('Nama tahap')).toBeVisible()
  await page.getByLabel('Jalankan step ini hanya jika syarat terpenuhi').check()
  await expect(page.getByLabel('Field data')).toBeVisible()
  await expect(page.getByLabel('Nilai pembanding')).toBeVisible()
})
