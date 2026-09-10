import { expect, test } from '@playwright/test'
import { loginAs, uniqueId } from './fixtures'

test.describe('Login', () => {
  test('logging in with a NIK redirects to the inbox and shows it in the header', async ({ page }) => {
    const nik = uniqueId('USER')

    await loginAs(page, nik)

    await expect(page).toHaveURL(/\/inbox$/)
    await expect(page.getByText(nik.toUpperCase())).toBeVisible()
  })

  test('visiting a protected page while logged out redirects to login', async ({ page }) => {
    // Fresh context per test (Playwright default), so localStorage is empty.
    await page.goto('/inbox')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('logging out clears the session and redirects protected pages to login', async ({ page }) => {
    await loginAs(page, uniqueId('USER'))

    await page.getByRole('button', { name: 'Keluar' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await page.goto('/workflows')
    await expect(page).toHaveURL(/\/login$/)
  })
})
