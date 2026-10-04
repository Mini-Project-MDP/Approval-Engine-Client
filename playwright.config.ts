import { defineConfig, devices } from '@playwright/test'

// The Go backend is NOT started by this config — it must already be running
// (`go run ./cmd/api` in Approval-Engine-Service, with DATABASE_URL set)
// before running these tests (with ADMIN_API_KEY set, and E2E_ADMIN_KEY set to
// the same value here), since the suite seeds its own fixture data
// against the real API rather than relying on manually-seeded demo data.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1, // all tests share one real backend/database — keep them serial
  retries: 0,
  reporter: 'list',
  // A decision does several sequential round trips to a remote Turso replica
  // (load request, load/update assignment, update step, advance to the next
  // step...), so the default 5s expect timeout is too tight under real
  // network latency — this is accepted engine latency for a 3-day scope, not
  // something to prematurely optimize away.
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
