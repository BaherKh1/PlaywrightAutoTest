import { test, expect } from '@playwright/test';

/**
 * LESSON 16 — Visual & snapshot testing
 *
 * FIRST RUN: there is no baseline, so the test FAILS once and writes the "expected" image.
 * Re-run and it passes. When the UI changes on purpose, refresh the baselines:
 *      npm run test:update-snapshots
 * Baselines are stored next to the spec and are OS/browser specific, so we pin to Chromium.
 * Commit them to git so teammates and CI compare against the same images.
 */
test.skip(({ browserName }) => browserName !== 'chromium', 'Baselines are generated for Chromium only');
test.use({ viewport: { width: 1280, height: 720 } });

test('full page screenshot comparison', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('login-page.png');
});

test('element screenshot comparison', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.login_logo')).toHaveScreenshot('login-logo.png');
});

test('mask dynamic areas so they do not cause false failures', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('login-masked.png', {
    mask: [page.getByTestId('login-credentials')], // painted over before comparing
    maxDiffPixelRatio: 0.05,
  });
});

test('ARIA snapshot: assert the accessibility TREE (stable and human readable)', async ({ page }) => {
  await page.setContent(/* html */ `
    <h1>Welcome</h1>
    <ul><li>One</li><li>Two</li></ul>
    <button>Go</button>
  `);
  await expect(page.locator('body')).toMatchAriaSnapshot(`
    - heading "Welcome" [level=1]
    - list:
      - listitem: One
      - listitem: Two
    - button "Go"
  `);
});
