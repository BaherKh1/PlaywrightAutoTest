import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load variables from .env (optional). Real environment variables always win.
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * THE CONFIG FILE — the control centre of Playwright.
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Where the tests live
  testDir: './tests',
  // Where screenshots / videos / traces are written
  outputDir: 'test-results',

  // ---- Execution -----------------------------------------------------------
  fullyParallel: true,                         // run tests inside one file in parallel too
  forbidOnly: !!process.env.CI,                // fail CI if someone left test.only in the code
  retries: process.env.CI ? 2 : 0,             // retry flaky tests on CI only
  workers: process.env.CI ? 2 : undefined,     // undefined = half of your CPU cores

  // ---- Timeouts ------------------------------------------------------------
  timeout: 30_000,                             // max time for ONE test
  expect: {
    timeout: 5_000,                            // max time an auto-retrying assertion waits
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },

  // ---- Reporting -----------------------------------------------------------
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],

  // ---- Defaults applied to every test (override with test.use) -------------
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    // Saucedemo uses data-test="..." so getByTestId() looks at that attribute.
    // (The TodoMVC tests override this to "data-testid" with test.use.)
    testIdAttribute: 'data-test',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',                   // 'on' while learning if you like
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // ---- Projects = browsers / devices / setup steps -------------------------
  projects: [
    // 1) Setup project: logs in once and saves the session (see tests/auth.setup.ts)
    { name: 'setup', testMatch: /.*\.setup\.ts/, teardown: 'cleanup' },
    // 2) Teardown project: runs after ALL dependent projects finish
    { name: 'cleanup', testMatch: /.*\.teardown\.ts/ },

    // 3) Real test projects, all depend on "setup"
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, dependencies: ['setup'] },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, dependencies: ['setup'] },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
      grep: /@mobile/,                         // only run tests tagged @mobile
    },
  ],
});
