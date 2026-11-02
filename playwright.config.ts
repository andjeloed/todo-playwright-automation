import { defineConfig, devices } from '@playwright/test';

const outputRoot = process.env.OUTPUT_DIR ?? '.';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  failOnFlakyTests: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: `${outputRoot}/test-results`,
  reporter: [
    ['line'],
    ['allure-playwright', { resultsDir: `${outputRoot}/allure-results`, detail: true }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:8080',
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(process.env.START_APP === '1' ? {
    webServer: {
      command: 'npm start --prefix /opt/kitchensink',
      url: 'http://localhost:8080/todo',
      reuseExistingServer: false,
      timeout: 60_000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    },
  } : {}),
});
