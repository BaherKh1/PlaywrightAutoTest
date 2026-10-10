import { test, expect } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage';
import { TODOMVC } from '../../utils/constants';

/**
 * LESSON 14 — Structuring tests
 * hooks, describe, steps, tags, annotations (skip / fixme / fail / slow), custom timeouts
 */
test.use({ baseURL: TODOMVC, testIdAttribute: 'data-testid' });

test.describe('hooks run in this order: beforeAll > beforeEach > test > afterEach > afterAll', () => {
  test.beforeAll(async () => {
    // Once per worker, per describe block. Good for expensive shared setup (no `page` here!).
    console.log('[beforeAll] runs once');
  });

  test.beforeEach(async ({ page }) => {
    // Before EVERY test; has access to fixtures like `page`.
    await new TodoPage(page).goto();
  });

  test.afterEach(async ({}, testInfo) => {
    // After every test, even failed ones. testInfo tells you what happened.
    console.log(`[afterEach] "${testInfo.title}" finished with status: ${testInfo.status}`);
  });

  test.afterAll(async () => {
    console.log('[afterAll] runs once');
  });

  test('a normal test', async ({ page }) => {
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
  });

  test('nested describe + steps give readable reports', async ({ page }) => {
    const todo = new TodoPage(page);
    await test.step('add an item', async () => {
      await todo.add('learn playwright');
    });
    await test.step('verify it is listed', async () => {
      await expect(todo.titles).toHaveText(['learn playwright']);
    });
  });
});

test.describe('tags and annotations', () => {
  test.beforeEach(async ({ page }) => {
    await new TodoPage(page).goto();
  });

  // Run only these:  npx playwright test --grep @regression    |    exclude: --grep-invert @slow
  test('tagged test', { tag: ['@regression', '@todo'] }, async ({ page }) => {
    await expect(page).toHaveTitle(/TodoMVC/);
  });

  test('custom annotation shows up in the report', {
    annotation: { type: 'issue', description: 'https://github.com/your-org/your-repo/issues/123' },
  }, async ({ page }) => {
    await expect(page).toHaveTitle(/TodoMVC/);
  });

  test.skip('skipped: not relevant right now', async () => {});

  test.fixme('fixme: known bug, test is written but disabled', async () => {});

  test('conditionally skip based on browser', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Example: skip on Safari because of bug #123');
    await expect(page).toHaveTitle(/TodoMVC/);
  });

  test('test.fail: we EXPECT this to fail (documents a known bug)', async () => {
    test.fail();
    expect(1 + 1).toBe(3);
  });

  test('test.slow triples the timeout', async ({ page }) => {
    test.slow();
    await expect(page).toHaveTitle(/TodoMVC/);
  });

  test('custom timeout for one test', async ({ page }) => {
    test.setTimeout(60_000);
    await expect(page).toHaveTitle(/TodoMVC/);
  });

  test('attach extra info to the report', async ({ page }, testInfo) => {
    await testInfo.attach('page-url', { body: page.url(), contentType: 'text/plain' });
    await testInfo.attach('screenshot', { body: await page.screenshot(), contentType: 'image/png' });
  });
});
