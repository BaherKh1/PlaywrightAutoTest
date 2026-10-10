import { test, expect } from '@playwright/test';
import { THE_INTERNET } from '../../utils/constants';

/** HTTP Basic Auth: set credentials on the context, no login form needed. */
test.describe('HTTP basic auth', () => {
  test.use({
    baseURL: THE_INTERNET,
    httpCredentials: { username: 'admin', password: 'admin' },
  });

  test('credentials are sent automatically', async ({ page }) => {
    await page.goto('/basic_auth');
    await expect(page.locator('p')).toContainText('Congratulations');
  });
});

test.describe('without credentials', () => {
  test.use({ baseURL: THE_INTERNET });

  test('the server answers 401', async ({ request }) => {
    const response = await request.get('/basic_auth');
    expect(response.status()).toBe(401);
  });
});
