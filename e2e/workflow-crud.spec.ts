import { expect, test } from '@playwright/test'
import { loginAs, selectAntdOption, uniqueId } from './fixtures'

test.describe('Workflow management UI', () => {
  test('registering an application and publishing a workflow through the form', async ({ page }) => {
    await loginAs(page, uniqueId('ADMIN'))

    // --- Register a new application ---
    await page.goto('/applications')
    const appName = uniqueId('E2E App')
    await page.getByPlaceholder('code, mis. assetmgmt').fill(uniqueId('code'))
    await page.getByPlaceholder('Nama, mis. Asset Management').fill(appName)
    await page.getByRole('button', { name: 'Daftarkan' }).click()

    await expect(page.getByText(/Simpan API key ini sekarang/)).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: appName })).toBeVisible()

    // --- Publish a workflow for it, exercising the dynamic step editor:
    // switch a step to the cross-function "role" resolver and add a
    // conditional gate, the two richest parts of the form. ---
    await page.goto('/workflows/new')

    await selectAntdOption(page, 'Aplikasi', appName)

    const docType = uniqueId('doctype')
    await page.getByLabel('Jenis dokumen (doc_type)').fill(docType)
    await page.getByLabel('Nama workflow').fill('E2E Reimbursement Approval')

    await page.getByPlaceholder('Nama step, mis. Supervisor Approval').fill('Finance Review')
    await selectAntdOption(page, 'Approver ditentukan oleh', 'Jabatan tertentu')
    await page.getByPlaceholder('mis. Asset Officer').fill('Finance Reviewer')
    await page.getByPlaceholder('mis. System Support').fill('Finance')

    await page.getByLabel('Jalankan step ini hanya jika syarat terpenuhi').check()
    await page.getByPlaceholder('field, mis. amount').fill('amount')
    await page.getByPlaceholder('nilai, mis. 50000000').fill('10000000')

    await page.getByRole('button', { name: 'Simpan workflow' }).click()

    // Publishing redirects to the list, where the new workflow must appear
    // as version 1 and active.
    await expect(page).toHaveURL(/\/workflows$/)
    const row = page.getByRole('row').filter({ hasText: docType })
    await expect(row).toBeVisible()
    await expect(row.getByText('Aktif', { exact: true })).toBeVisible()
    await expect(row.getByText('v1')).toBeVisible()

    // --- Deactivating (Popconfirm, not a native dialog) hides the action
    // and flips the badge ---
    await row.getByRole('button', { name: 'Nonaktifkan' }).click()
    await page.getByRole('button', { name: 'Ya, nonaktifkan' }).click()
    await expect(row.getByText('Nonaktif', { exact: true })).toBeVisible()
  })
})
