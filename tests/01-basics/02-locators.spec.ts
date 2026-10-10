import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../../utils/constants';

/**
 * LESSON 2 — Locators (how to find elements)
 *
 * Recommended order of preference (user-facing first, implementation details last):
 *   1. getByRole   2. getByLabel   3. getByPlaceholder   4. getByText
 *   5. getByAltText   6. getByTitle   7. getByTestId   8. CSS / XPath (last resort)
 *
 * Locators are LAZY and RE-EVALUATED on each action: they never go stale.
 */
test.describe('locators on a self-contained playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(/* html */ `
      <h1>Playground</h1>
      <label for="email">Email address</label>
      <input id="email" type="email" placeholder="you@example.com" />
      <button title="Save your work">Save</button>
      <button>Save as draft</button>
      <img alt="Company logo" width="20" height="20"
           src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
      <ul id="fruits"><li>Apple</li><li>Banana</li><li>Cherry</li></ul>
      <a href="/docs">Documentation</a>
      <div data-test="note">Hello <b>world</b></div>
      <section><h2>Card A</h2><button>Buy</button></section>
      <section><h2>Card B</h2><button>Buy</button></section>
    `);
  });

  test('getByRole — the best default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Playground', level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/docs');
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(2);
  });

  test('name matching: substring by default, exact when you ask', async ({ page }) => {
    // "Save" matches BOTH "Save" and "Save as draft"
    await expect(page.getByRole('button', { name: 'Save' })).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toHaveCount(1);
  });

  test('getByLabel / getByPlaceholder', async ({ page }) => {
    await page.getByLabel('Email address').fill('ada@example.com');
    await expect(page.getByPlaceholder('you@example.com')).toHaveValue('ada@example.com');
  });

  test('getByText', async ({ page }) => {
    await expect(page.getByText('Banana')).toBeVisible();
    await expect(page.getByText(/^apple$/i)).toBeVisible(); // regex, case-insensitive
    await expect(page.getByText('Hello world')).toBeVisible(); // matches across nested elements
  });

  test('getByAltText / getByTitle / getByTestId', async ({ page }) => {
    await expect(page.getByAltText('Company logo')).toBeVisible();
    await expect(page.getByTitle('Save your work')).toBeVisible();
    await expect(page.getByTestId('note')).toContainText('world'); // attribute set in config: data-test
  });

  test('CSS and XPath (last resort)', async ({ page }) => {
    await expect(page.locator('#fruits li')).toHaveCount(3);
    await expect(page.locator('css=ul > li:nth-child(2)')).toHaveText('Banana');
    await expect(page.locator('xpath=//ul/li[3]')).toHaveText('Cherry');
    await expect(page.locator('li:has-text("Apple")')).toBeVisible();
  });

  test('working with lists', async ({ page }) => {
    const fruits = page.locator('#fruits li');
    await expect(fruits.first()).toHaveText('Apple');
    await expect(fruits.nth(1)).toHaveText('Banana');
    await expect(fruits.last()).toHaveText('Cherry');
    await expect(fruits).toHaveText(['Apple', 'Banana', 'Cherry']);

    expect(await fruits.count()).toBe(3);
    expect(await fruits.allTextContents()).toEqual(['Apple', 'Banana', 'Cherry']);

    for (const fruit of await fruits.all()) {
      await expect(fruit).toBeVisible();
    }
  });

  test('chaining and filtering', async ({ page }) => {
    // Find the "Buy" button INSIDE the card whose heading says "Card B"
    const cardB = page.locator('section').filter({ hasText: 'Card B' });
    await expect(cardB.getByRole('button', { name: 'Buy' })).toBeVisible();

    const cardA = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Card A' }) });
    await expect(cardA).toHaveCount(1);

    const notCardA = page.locator('section').filter({ hasNotText: 'Card A' });
    await expect(notCardA).toHaveCount(1);
  });

  test('combining locators with and() / or()', async ({ page }) => {
    const saveWithTitle = page.getByRole('button').and(page.getByTitle('Save your work'));
    await expect(saveWithTitle).toHaveCount(1);

    const either = page.getByRole('link', { name: 'Documentation' }).or(page.getByRole('link', { name: 'Docs' }));
    await expect(either).toBeVisible();
  });

  test('STRICT MODE: a locator that matches 2+ elements cannot be acted on', async ({ page }) => {
    const buy = page.getByRole('button', { name: 'Buy' }); // matches 2 buttons
    await expect(buy.click({ timeout: 1_000 })).rejects.toThrow(/strict mode violation/);
    await buy.first().click(); // fix: be more specific, or pick one on purpose
  });
});

test.describe('locators on a real page (logged in via saved session)', () => {
  test.use({ storageState: STORAGE_STATE });

  test('product cards', async ({ page }) => {
    await page.goto('/inventory.html');
    const backpack = page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' });
    await expect(backpack.getByTestId('inventory-item-price')).toHaveText('$29.99');
    await expect(backpack.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
  });
});
