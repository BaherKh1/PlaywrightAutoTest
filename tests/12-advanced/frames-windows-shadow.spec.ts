import { test, expect } from '@playwright/test';
import { THE_INTERNET } from '../../utils/constants';

/**
 * LESSON 17 — iframes, multiple tabs / popups, Shadow DOM
 */
test.describe('iframes', () => {
  test('frameLocator gives you locators scoped inside an iframe (even nested ones)', async ({ page }) => {
    await page.setContent(/* html */ `
      <h1>Checkout</h1>
      <iframe title="Payment" srcdoc="
        <label>Card number <input id='card' /></label>
        <button>Pay</button>
        <iframe title='3D Secure' srcdoc='<p>Confirm payment</p>'></iframe>
      "></iframe>
    `);

    const payment = page.frameLocator('iframe[title="Payment"]');
    await payment.getByLabel('Card number').fill('4242 4242 4242 4242');
    await expect(payment.getByLabel('Card number')).toHaveValue('4242 4242 4242 4242');
    await expect(payment.getByRole('button', { name: 'Pay' })).toBeEnabled();

    const nested = payment.frameLocator('iframe[title="3D Secure"]');
    await expect(nested.getByText('Confirm payment')).toBeVisible();
  });
});

test.describe('multiple tabs and popups', () => {
  test.use({ baseURL: THE_INTERNET });

  test('a link that opens a new tab', async ({ page, context }) => {
    await page.goto('/windows');

    // Start waiting for the new page BEFORE the click that opens it.
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: 'Click Here' }).click(),
    ]);
    await newPage.waitForLoadState();

    await expect(newPage).toHaveURL(/\/windows\/new/);
    await expect(newPage.getByRole('heading', { name: 'New Window' })).toBeVisible();

    await newPage.close();
    await expect(page.getByRole('heading', { name: 'Opening a new window' })).toBeVisible(); // original tab is intact
  });

  test('window.open() popups', async ({ page }) => {
    await page.setContent(`<button onclick="window.open('about:blank#popup')">Open popup</button>`);
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Open popup' }).click();
    const popup = await popupPromise;
    expect(popup.url()).toContain('about:blank');
  });
});

test.describe('Shadow DOM', () => {
  test('Playwright locators pierce OPEN shadow roots automatically', async ({ page }) => {
    await page.setContent(/* html */ `
      <div id="host"></div>
      <script>
        const root = document.getElementById('host').attachShadow({ mode: 'open' });
        root.innerHTML = '<h2>Inside shadow</h2><button>Shadow button</button>';
      </script>
    `);

    await expect(page.getByRole('heading', { name: 'Inside shadow' })).toBeVisible();
    await expect(page.locator('#host').getByRole('button', { name: 'Shadow button' })).toBeEnabled();
  });
});
