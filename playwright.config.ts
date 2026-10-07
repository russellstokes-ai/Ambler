import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 7_500 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'CI=1 npm run start:web:test',
    url: 'http://127.0.0.1:4173/ui-preview',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'compact-phone', use: { browserName: 'chromium', viewport: { width: 360, height: 800 }, deviceScaleFactor: 1 } },
    { name: 'standard-phone', use: { browserName: 'chromium', viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 } },
    { name: 'fold-open', use: { browserName: 'chromium', viewport: { width: 884, height: 1104 }, deviceScaleFactor: 1 } },
  ],
});
