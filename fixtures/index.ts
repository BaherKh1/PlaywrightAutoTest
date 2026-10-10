import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { USERS } from '../test-data/users';

type Credentials = { username: string; password: string };

type MyFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** An InventoryPage for a user that is ALREADY logged in through the UI. */
  loggedInInventoryPage: InventoryPage;
  /** Auto fixture: runs for every test without being requested. */
  pageErrorLogger: void;
};

type MyOptions = {
  /** An "option" fixture: configurable with test.use({ userCredentials: ... }) */
  userCredentials: Credentials;
};

/**
 * CUSTOM FIXTURES
 * Fixtures are Playwright's dependency injection. Anything before `await use(...)` is
 * setup, anything after it is teardown. Fixtures are created lazily and only when a
 * test asks for them by name in its parameter list.
 */
export const test = base.extend<MyFixtures & MyOptions>({
  userCredentials: [USERS.standard, { option: true }],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  loggedInInventoryPage: async ({ loginPage, inventoryPage, userCredentials }, use) => {
    await loginPage.goto();
    await loginPage.login(userCredentials.username, userCredentials.password);
    await inventoryPage.expectLoaded();
    await use(inventoryPage);
    // (teardown code could go here)
  },

  pageErrorLogger: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await use();
      if (errors.length) {
        await testInfo.attach('uncaught-page-errors', { body: errors.join('\n'), contentType: 'text/plain' });
      }
    },
    { auto: true },
  ],
});

export { expect };
