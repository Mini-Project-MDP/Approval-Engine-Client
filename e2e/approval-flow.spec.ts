import { expect, test } from '@playwright/test'
import {
  createApprovalRequest,
  importParticipants,
  loginAs,
  publishWorkflow,
  registerApplication,
  uniqueId,
} from './fixtures'

test.describe('Approval flow end to end', () => {
  test('a two-step cross-function approval runs from creation to completion', async ({ page, request }) => {
    // --- Seed: an application, a supervisor + cross-function chain, and a
    // 2-step workflow — via the API directly, the same way a real Spring
    // Boot consumer and a system-support admin would use it.
    const app = await registerApplication(request, 'E2E Asset Management')

    const requesterId = uniqueId('REQ')
    const supervisorId = uniqueId('SUP')
    const assetOfficerId = uniqueId('AST')

    await importParticipants(request, [
      {
        user_id: requesterId,
        name: 'E2E Requester',
        position: 'Sales Admin',
        department: 'Sales',
        superior_id: supervisorId,
        is_active: true,
      },
      { user_id: supervisorId, name: 'E2E Supervisor', position: 'Supervisor', department: 'Sales', is_active: true },
      {
        user_id: assetOfficerId,
        name: 'E2E Asset Officer',
        position: 'Asset Officer',
        department: 'System Support',
        is_active: true,
      },
    ])

    const docType = uniqueId('doctype')
    await publishWorkflow(request, {
      app_id: app.id,
      doc_type: docType,
      name: 'E2E Purchase Order',
      steps: [
        {
          name: 'Supervisor Approval',
          resolver_rule: { type: 'superior', level: 1 },
          approval_mode: 'any',
          on_empty: 'fail',
        },
        {
          name: 'Asset Team Approval',
          resolver_rule: { type: 'role', position: 'Asset Officer', department: 'System Support' },
          approval_mode: 'any',
          on_empty: 'fail',
        },
      ],
    })

    const resourceId = uniqueId('PO')
    await createApprovalRequest(request, app.apiKey, {
      doc_type: docType,
      resource_id: resourceId,
      requester_id: requesterId,
      payload: { amount: 1_000_000 },
    })

    // --- Step 1: the supervisor sees it in their inbox and approves it ---
    await loginAs(page, supervisorId)
    await page.getByRole('row').filter({ hasText: resourceId }).click()

    await expect(page.getByText('Supervisor Approval')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Setujui' })).toBeVisible()

    await page.getByRole('button', { name: 'Setujui' }).click()

    // Step 1 closes, step 2 activates for a different department — proving
    // the cross-function hop actually works end to end through the UI.
    await expect(page.getByText('Asset Team Approval')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Setujui' })).toHaveCount(0)

    // --- Step 2: the asset officer approves the final step ---
    await page.getByRole('button', { name: 'Keluar' }).click()
    await loginAs(page, assetOfficerId)
    await page.getByRole('row').filter({ hasText: resourceId }).click()

    await page.getByRole('button', { name: 'Setujui' }).click()

    await expect(page.getByText('Disetujui').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Setujui' })).toHaveCount(0)
  })

  test('a rejection ends the request immediately without activating later steps', async ({ page, request }) => {
    const app = await registerApplication(request, 'E2E Asset Management (reject)')

    const requesterId = uniqueId('REQ')
    const supervisorId = uniqueId('SUP')

    await importParticipants(request, [
      {
        user_id: requesterId,
        name: 'E2E Requester',
        position: 'Sales Admin',
        department: 'Sales',
        superior_id: supervisorId,
        is_active: true,
      },
      { user_id: supervisorId, name: 'E2E Supervisor', position: 'Supervisor', department: 'Sales', is_active: true },
    ])

    const docType = uniqueId('doctype')
    await publishWorkflow(request, {
      app_id: app.id,
      doc_type: docType,
      name: 'E2E Rejectable Flow',
      steps: [
        { name: 'Supervisor Approval', resolver_rule: { type: 'superior', level: 1 } },
        { name: 'Should Never Activate', resolver_rule: { type: 'static', user_id: requesterId } },
      ],
    })

    const resourceId = uniqueId('PO')
    await createApprovalRequest(request, app.apiKey, {
      doc_type: docType,
      resource_id: resourceId,
      requester_id: requesterId,
    })

    await loginAs(page, supervisorId)
    await page.getByRole('row').filter({ hasText: resourceId }).click()
    await page.getByRole('button', { name: 'Tolak' }).click()
    // Reject is guarded by a Popconfirm — confirm before it actually submits.
    await page.getByRole('button', { name: 'Ya, tolak' }).click()

    await expect(page.getByText('Ditolak').first()).toBeVisible()
    await expect(page.getByText('Should Never Activate')).toHaveCount(0)
  })
})
