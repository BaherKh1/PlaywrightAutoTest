import { test, expect } from '@playwright/test';

/**
 * LESSON 3 — Assertions
 *
 * Two families:
 *  1. WEB-FIRST assertions: `await expect(locator).toXxx()`  -> AUTO-RETRY until they pass
 *     or the expect timeout (5s in our config) is reached. Use these for anything on the page.
 *  2. GENERIC assertions: `expect(value).toBe()`  -> evaluated ONCE, like Jest. Use for plain data.
 */
test.describe('web-first assertions', () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(/* html */ `
      <title>Assertion Playground</title>
      <input id="name" value="Ada" class="field primary" style="color: rgb(255, 0, 0)" />
      <input id="locked" disabled />
      <input id="agree" type="checkbox" checked />
      <input id="empty" />
      <button style="display:none">Secret</button>
      <button aria-label="Close dialog">X</button>
      <p id="msg" data-status="ok">Hello <b>Playwright</b></p>
      <ul><li>One</li><li>Two</li><li>Three</li></ul>
    `);
  });

  test('visibility and state', async ({ page }) => {
    await expect(page.locator('#msg')).toBeVisible();
    await expect(page.getByText('Secret')).toBeHidden();
    await expect(page.locator('#name')).toBeEnabled();
    await expect(page.locator('#name')).toBeEditable();
    await expect(page.locator('#locked')).toBeDisabled();
    await expect(page.locator('#agree')).toBeChecked();
    await expect(page.locator('#empty')).toBeEmpty();
  });

  test('content and attributes', async ({ page }) => {
    await expect(page.locator('#name')).toHaveValue('Ada');
    await expect(page.locator('#name')).toHaveClass(/primary/);
    await expect(page.locator('#name')).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(page.locator('#msg')).toHaveAttribute('data-status', 'ok');
    await expect(page.locator('#msg')).toHaveId('msg');
    await expect(page.locator('#msg')).toHaveText('Hello Playwright'); // full text (whitespace-normalised)
    await expect(page.locator('#msg')).toContainText('Playwright'); // substring
    await expect(page.getByRole('button', { name: 'Close dialog' })).toHaveAccessibleName('Close dialog');
    await expect(page.locator('li')).toHaveCount(3);
    await expect(page.locator('li')).toHaveText(['One', 'Two', 'Three']);
  });

  test('page-level assertions and focus', async ({ page }) => {
    await expect(page).toHaveTitle('Assertion Playground');
    await expect(page).toHaveURL('about:blank');
    await page.locator('#name').focus();
    await expect(page.locator('#name')).toBeFocused();
  });

  test('negation, custom messages and custom timeouts', async ({ page }) => {
    await expect(page.locator('#locked')).not.toBeEnabled();
    await expect(page.locator('#msg'), 'the welcome message should be on screen').toBeVisible({ timeout: 2_000 });
  });

  test('soft assertions: record failures but keep the test running', async ({ page }) => {
    await expect.soft(page.locator('#name')).toHaveValue('Ada');
    await expect.soft(page.locator('#msg')).toContainText('Hello');
    await expect.soft(page.locator('li')).toHaveCount(3);
    // The test is marked failed at the END if any soft assertion failed.
  });
});

test.describe('generic assertions and polling', () => {
  test('plain values (no auto-retry)', async () => {
    const user = { id: 7, name: 'Ada', tags: ['math', 'code'] };
    expect(user.id).toBe(7);
    expect(user).toEqual({ id: 7, name: 'Ada', tags: ['math', 'code'] });
    expect(user).toMatchObject({ name: 'Ada' });
    expect(user.tags).toContain('code');
    expect(user.name).toMatch(/^A/);
    expect(user.id).toBeGreaterThan(5);
    expect(user).toEqual(expect.objectContaining({ id: expect.any(Number) }));
  });

  test('expect.poll and expect().toPass() retry arbitrary logic', async ({ page }) => {
    await page.setContent(`<script>window.n = 0; setInterval(() => window.n++, 100);</script>`);
    const readCounter = () => page.evaluate(() => (window as any).n as number);

    // poll: retry a function until the matcher passes
    await expect.poll(readCounter, { timeout: 5_000 }).toBeGreaterThan(3);

    // toPass: retry a whole block of code
    await expect(async () => {
      expect(await readCounter()).toBeGreaterThan(6);
    }).toPass({ timeout: 5_000 });
  });
});
