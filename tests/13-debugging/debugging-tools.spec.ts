import { test, expect } from '@playwright/test';
import { FAKE_APP_URL, serveFakeApp } from '../../utils/fakeApp';

/**
 * LESSON 20 — Debugging & observability
 *
 * Tools (try each one!):
 *   npx playwright test --ui                    UI mode: watch mode, time travel, locator picker
 *   npx playwright test --debug                 Playwright Inspector, step through the test
 *   npx playwright test --headed --slowMo=500   watch the browser (slowMo is set in launchOptions)
 *   npx playwright test --trace on              record a trace for every test
 *   npx playwright show-trace test-results/<folder>/trace.zip
 *   npx playwright show-report                  open the HTML report
 *   npx playwright codegen <url>                record your clicks and get code (+ "Pick locator")
 *   await page.pause()                          drop an Inspector breakpoint inside a test
 *   PWDEBUG=console npx playwright test         adds `playwright` helpers to the browser console
 */
test('listen to browser console messages', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', (msg) => messages.push(`${msg.type()}: ${msg.text()}`));

  await serveFakeApp(page);
  await page.goto(FAKE_APP_URL);

  expect(messages).toContain('log: Fake app ready');
});

test('catch uncaught JavaScript errors', async ({ page }) => {
  const errorPromise = page.waitForEvent('pageerror');
  await page.setContent(`<script>setTimeout(() => { throw new Error('kaboom'); }, 0)</script>`);
  const error = await errorPromise;
  expect(error.message).toContain('kaboom');
});

test('log network traffic', async ({ page }) => {
  const calls: string[] = [];
  page.on('response', (res) => calls.push(`${res.status()} ${res.request().method()} ${res.url()}`));

  await serveFakeApp(page);
  await page.goto(FAKE_APP_URL);
  await page.getByRole('button', { name: 'Load users' }).click();
  await expect(page.getByRole('status')).toHaveText('Loaded 2 users');

  expect(calls).toContain(`200 GET ${FAKE_APP_URL}/api/users`);
});

test('manual screenshots, locator highlighting and attachments', async ({ page }, testInfo) => {
  await serveFakeApp(page);
  await page.goto(FAKE_APP_URL);

  await page.screenshot({ path: testInfo.outputPath('full.png'), fullPage: true });
  await page.getByRole('button', { name: 'Load users' }).screenshot({ path: testInfo.outputPath('button.png') });

  await page.getByRole('button', { name: 'Load users' }).highlight(); // flashes it in headed/debug mode
  await testInfo.attach('html-snapshot', { body: await page.content(), contentType: 'text/html' });

  // await page.pause();   // <- uncomment to stop here and inspect interactively
});

test('step-by-step trace titles make failures easy to read', async ({ page }) => {
  await serveFakeApp(page);
  await test.step('open the app', () => page.goto(FAKE_APP_URL));
  await test.step('load the users', async () => {
    await page.getByRole('button', { name: 'Load users' }).click();
    await expect(page.getByRole('listitem')).toHaveCount(2);
  });
});
