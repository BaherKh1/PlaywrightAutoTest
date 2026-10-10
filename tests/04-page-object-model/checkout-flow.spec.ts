import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { USERS, PRODUCTS } from '../../test-data/users';
import { buildCheckoutInfo } from '../../utils/data-factory';

/**
 * LESSON 8 — Page Object Model, end-to-end
 * Here we create the page objects by hand in beforeEach. Lesson 9 shows how fixtures
 * do this for you.
 */
test.describe('shopping flow', () => {
  let loginPage: LoginPage;
  let inventory: InventoryPage;
  let cart: CartPage;
  let checkout: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventory = new InventoryPage(page);
    cart = new CartPage(page);
    checkout = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventory.expectLoaded();
  });

  test('complete purchase of two products', { tag: '@smoke' }, async ({ page }) => {
    await test.step('add two products to the cart', async () => {
      await inventory.addToCart(PRODUCTS.backpack.name);
      await inventory.addToCart(PRODUCTS.bikeLight.name);
      await expect(inventory.cartBadge).toHaveText('2');
    });

    await test.step('review the cart', async () => {
      await inventory.openCart();
      await expect(page).toHaveURL(/cart\.html/);
      await expect(cart.itemNames).toHaveText([PRODUCTS.backpack.name, PRODUCTS.bikeLight.name]);
    });

    await test.step('enter shipping information', async () => {
      await cart.checkout();
      await checkout.fillInformation(buildCheckoutInfo());
      await expect(page).toHaveURL(/checkout-step-two\.html/);
      await expect(checkout.subtotal).toHaveText('Item total: $39.98');
    });

    await test.step('finish the order', async () => {
      await checkout.finish();
      await expect(checkout.completeHeader).toHaveText('Thank you for your order!');
    });
  });

  test('remove a product from the cart', async () => {
    await inventory.addToCart(PRODUCTS.onesie.name);
    await expect(inventory.cartBadge).toHaveText('1');

    await inventory.removeFromCart(PRODUCTS.onesie.name);
    await expect(inventory.cartBadge).toBeHidden();
  });

  test('checkout requires a first name', async ({ page }) => {
    await inventory.addToCart(PRODUCTS.jacket.name);
    await inventory.openCart();
    await cart.checkout();
    await checkout.continueButton.click();
    await expect(page.getByTestId('error')).toHaveText('Error: First Name is required');
  });

  test('logging out returns to the login page', async ({ page }) => {
    await inventory.logout();
    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();
  });
});
