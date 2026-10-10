import { test, expect } from '@playwright/test';
import { THE_INTERNET } from '../../utils/constants';
import { FAKE_APP_URL, serveFakeApp } from '../../utils/fakeApp';

/**
 * LESSON 7 — Auto-waiting (the secret of stable tests)
 *
 * Before every action Playwright automatically waits until the element is:
 *   attached, visible, stable (not animating), enabled, and not covered by another element.
 * Web-first assertions retry until they pass. So you almost NEVER need manual waits.
 */
test.describe('on the-internet.herokuapp.com', () => {
  test.use({ baseURL: THE_INTERNET });

  test('auto-wait: element appears after a loading bar', async ({ page }) => {
    await page.goto('/dynamic_loading/1'); // element exists but is hidden, becomes visible later
    await page.getByRole('button', { name: 'Start' }).click();

    // No sleep needed: the assertion retries until the text shows up.
    await expect(page.locator('#finish h4')).toHaveText('Hello World!');
  });

  test('explicit waits are for special cases only', async ({ page }) => {
    await page.goto('/dynamic_loading/2'); // element is added to the DOM later
    await page.getByRole('button', { name: 'Start' }).click();

    await page.locator('#loading').waitFor({ state: 'hidden' }); // wait for the spinner to go away
    await page.locator('#finish').waitFor({ state: 'visible' });
    await expect(page.locator('#finish h4')).toHaveText('Hello World!');
  });

  test('waiting for navigation, load state and URL', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Form Authentication' }).click();
    await page.waitForURL('**/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'Login Page' })).toBeVisible();
  });

  test('elements that are added and removed dynamically', async ({ page }) => {
    await page.goto('/add_remove_elements/');
    const deleteButtons = page.getByRole('button', { name: 'Delete' });

    await expect(deleteButtons).toHaveCount(0);
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Add Element' }).click();
    }
    await expect(deleteButtons).toHaveCount(3);
    await deleteButtons.first().click();
    await expect(deleteButtons).toHaveCount(2);
  });
});

test.describe('waiting for network events', () => {
  test('waitForResponse: click and wait for the API call in parallel', async ({ page }) => {
    await serveFakeApp(page);
    await page.goto(FAKE_APP_URL);

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().endsWith('/api/users') && res.status() === 200),
      page.getByRole('button', { name: 'Load users' }).click(),
    ]);

    expect(await response.json()).toHaveLength(2);
    await expect(page.getByRole('status')).toHaveText('Loaded 2 users');
  });
});

test.describe('controlling time with the Clock API', () => {
  test('fast-forward a 60 second timer instantly', async ({ page }) => {
    await page.clock.install(); // must be called BEFORE the page's scripts run
    await page.setContent(/* html */ `
      <p id="out">waiting...</p>
      <script>setTimeout(() => { document.getElementById('out').textContent = 'done'; }, 60000);</script>
    `);

    await expect(page.locator('#out')).toHaveText('waiting...');
    await page.clock.runFor(61_000); // jump 61 seconds ahead, no real waiting
    await expect(page.locator('#out')).toHaveText('done');
  });
});

/*
 * ANTI-PATTERN (don't do this):
 *   await page.waitForTimeout(3000);   // hard sleeps = slow AND flaky
 * Use web-first assertions or waitFor() on a real condition instead.
 */
