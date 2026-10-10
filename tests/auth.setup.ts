import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE } from '../utils/constants';
import { USERS } from '../test-data/users';

/**
 * AUTHENTICATION SETUP
 * Runs ONCE before the other projects (see `dependencies: ['setup']` in the config).
 * It logs in through the UI and saves cookies + localStorage to a file. Tests that
 * need to be logged in reuse that file and skip the login screen entirely = much faster.
 */
setup('authenticate as standard user', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill(USERS.standard.username);
  await page.getByTestId('password').fill(USERS.standard.password);
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/inventory\.html/);

  await page.context().storageState({ path: STORAGE_STATE });
});
