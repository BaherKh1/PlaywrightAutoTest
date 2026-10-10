import { test, expect } from '@playwright/test';
import { FAKE_APP_URL, serveFakeApp } from '../../utils/fakeApp';

/**
 * LESSON 18 — Emulation: locale, timezone, geolocation, permissions, dark mode, mobile
 */
test.describe('browser context options', () => {
  test.use({
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    colorScheme: 'dark',
    geolocation: { latitude: 48.8584, longitude: 2.2945 }, // Eiffel Tower
    permissions: ['geolocation'],
  });

  test('the page sees the emulated environment', async ({ page }) => {
    await serveFakeApp(page);
    await page.goto(FAKE_APP_URL);

    expect(await page.evaluate(() => navigator.language)).toBe('fr-FR');
    expect(await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone)).toBe('Europe/Paris');
    expect(await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches)).toBe(true);

    await page.getByRole('button', { name: 'Where am I?' }).click();
    await expect(page.locator('#geo-out')).toHaveText('48.86, 2.29');
  });

  test('change settings while the test runs', async ({ page, context }) => {
    await serveFakeApp(page);
    await page.goto(FAKE_APP_URL);

    await page.emulateMedia({ colorScheme: 'light' });
    expect(await page.evaluate(() => matchMedia('(prefers-color-scheme: light)').matches)).toBe(true);

    await context.setGeolocation({ latitude: 35.6586, longitude: 139.7454 }); // Tokyo Tower
    await page.getByRole('button', { name: 'Where am I?' }).click();
    await expect(page.locator('#geo-out')).toHaveText('35.66, 139.75');
  });
});

test.describe('mobile viewport', () => {
  // Runs only in the "mobile-chrome" project (Pixel 7), selected by the @mobile tag + isMobile.
  test.skip(({ isMobile }) => !isMobile, 'mobile project only');

  test('the burger menu is usable on a phone', { tag: '@mobile' }, async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').tap(); // tap() needs hasTouch (true for Pixel 7)

    const viewport = page.viewportSize();
    expect(viewport!.width).toBeLessThan(500);
    await page.getByRole('button', { name: 'Open Menu' }).tap();
    await expect(page.getByTestId('logout-sidebar-link')).toBeVisible();
  });
});
