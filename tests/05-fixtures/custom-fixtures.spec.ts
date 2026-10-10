import { test, expect } from '../../fixtures';
import { USERS, PRODUCTS } from '../../test-data/users';

/**
 * LESSON 9 — Custom fixtures
 * Import `test` from OUR fixtures file (not from @playwright/test) and just ask for what
 * you need by name. No more `new LoginPage(page)` boilerplate or repeated beforeEach login.
 */
test('fixtures hand you ready-made page objects', async ({ loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.login(USERS.standard.username, USERS.standard.password);
  await inventoryPage.expectLoaded();
});

test('a fixture can do the login for you', async ({ loggedInInventoryPage }) => {
  await loggedInInventoryPage.addToCart(PRODUCTS.backpack.name);
  await expect(loggedInInventoryPage.cartBadge).toHaveText('1');
});

test.describe('option fixtures: configure with test.use', () => {
  test.use({ userCredentials: USERS.problem });

  test('log in as the "problem" user', async ({ loggedInInventoryPage }) => {
    await expect(loggedInInventoryPage.items).toHaveCount(6);
  });
});

test('locked user sees an error', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login(USERS.locked.username, USERS.locked.password);
  await loginPage.expectError('Epic sadface: Sorry, this user has been locked out.');
});
