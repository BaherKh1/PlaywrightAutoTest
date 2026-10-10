import { test, expect } from '@playwright/test';
import { USERS } from '../../test-data/users';

/**
 * LESSON 1 — Your first tests
 *  - `test('name', async ({ page }) => {})`: every test gets a brand-new, isolated page
 *  - `page.goto()` + `baseURL` from the config (so we write '/' instead of the full URL)
 *  - Actions: fill, click. Assertions: expect(...).toXxx()
 *  - Tags like @smoke let you run a subset:  npx playwright test --grep @smoke
 */
test('the login page has the right title', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Swag Labs');
});

test('a user can log in with valid credentials', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Username').fill(USERS.standard.username);
  await page.getByPlaceholder('Password').fill(USERS.standard.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.getByText('Products')).toBeVisible();
});

test('a wrong password shows an error', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Username').fill(USERS.standard.username);
  await page.getByPlaceholder('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByTestId('error')).toContainText('Username and password do not match');
});
