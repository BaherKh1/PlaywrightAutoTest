import { test, expect, type Page } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage';
import { TODOMVC } from '../../utils/constants';

/**
 * LESSON 15 — Parallelism
 *  - Default: files run in parallel (workers). With `fullyParallel: true` EVERY test does.
 *  - Tests must be independent. If they truly can't be, use serial mode.
 *  - Serial: tests run in order, share one worker, and if one fails the rest are skipped.
 *
 * CLI: npx playwright test --workers=4   |   --workers=1   |   --fully-parallel
 */
test.describe('parallel mode (the default with fullyParallel)', () => {
  test.describe.configure({ mode: 'parallel' });

  test('independent test A', async ({ page }) => {
    await page.goto(`${TODOMVC}/todomvc`);
    await expect(page).toHaveTitle(/TodoMVC/);
  });

  test('independent test B', async ({ page }) => {
    await page.goto(`${TODOMVC}/todomvc`);
    await expect(page.getByPlaceholder('What needs to be done?')).toBeEditable();
  });
});

test.describe('serial mode: ordered steps sharing one page', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ testIdAttribute: 'data-testid' });

  let page: Page;
  let todo: TodoPage;

  test.beforeAll(async ({ browser }) => {
    // Shared page for the whole describe block (create it yourself since `page` is per-test)
    page = await browser.newPage({ baseURL: TODOMVC });
    todo = new TodoPage(page);
    await todo.goto();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('step 1: add a todo', async () => {
    await todo.add('first');
    await expect(todo.items).toHaveCount(1);
  });

  test('step 2: it is still there, add another', async () => {
    await expect(todo.items).toHaveCount(1);
    await todo.add('second');
    await expect(todo.items).toHaveCount(2);
  });

  test('step 3: complete everything', async () => {
    await todo.toggle('first');
    await todo.toggle('second');
    await expect(todo.count).toContainText('0');
  });
});
