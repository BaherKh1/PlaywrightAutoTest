import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../../utils/constants';
import { InventoryPage } from '../../pages/InventoryPage';

/**
 * LESSON 12 — Authentication & browser contexts
 *
 * Each test gets its own BrowserContext = like a fresh incognito window (own cookies,
 * storage, cache). Tests can never leak state into each other.
 * To skip repetitive logins, tests/auth.setup.ts saves the session to a file and we
 * load it with `storageState`.
 */
test.describe('already logged in (session from the setup project)', () => {
  test.use({ storageState: STORAGE_STATE });

  test('open a protected page directly, no login needed', { tag: '@smoke' }, async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await inventory.expectLoaded();
    await expect(inventory.items).toHaveCount(6);
  });
});

test.describe('not logged in', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // explicitly start with an empty session

  test('protected pages redirect to the login page', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('error')).toContainText("You can only access '/inventory.html' when you are logged in");
  });
});

test('two users at the same time: contexts are isolated', async ({ browser, baseURL }) => {
  const contextA = await browser.newContext({ baseURL, storageState: STORAGE_STATE });
  const contextB = await browser.newContext({ baseURL, storageState: STORAGE_STATE });
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  const inventoryA = new InventoryPage(pageA);
  const inventoryB = new InventoryPage(pageB);
  await inventoryA.goto();
  await inventoryB.goto();

  await inventoryA.addToCart('Sauce Labs Backpack');
  await expect(inventoryA.cartBadge).toHaveText('1');
  await expect(inventoryB.cartBadge).toBeHidden(); // B never sees A's cart

  await contextA.close();
  await contextB.close();
});
