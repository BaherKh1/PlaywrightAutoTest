import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * LESSON 19 — Automated accessibility checks with axe-core
 * Catches ~30-50% of a11y problems automatically. It does NOT replace manual testing,
 * but it's a cheap safety net that fits into any test.
 */
const GOOD_PAGE = /* html */ `
  <!doctype html>
  <html lang="en">
    <head><title>Accessible page</title></head>
    <body>
      <main>
        <h1>Hello</h1>
        <img alt="Company logo" width="20" height="20" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
        <label for="q">Search</label><input id="q" />
        <button>Save</button>
      </main>
    </body>
  </html>`;

const BAD_PAGE = /* html */ `
  <!doctype html>
  <html lang="en">
    <head><title>Inaccessible page</title></head>
    <body>
      <main>
        <h1>Hello</h1>
        <img width="20" height="20" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
        <input />
      </main>
    </body>
  </html>`;

test('an accessible page has no violations', async ({ page }) => {
  await page.setContent(GOOD_PAGE);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('violations are reported with rule ids you can act on', async ({ page }) => {
  await page.setContent(BAD_PAGE);
  const results = await new AxeBuilder({ page }).analyze();

  const ids = results.violations.map((v) => v.id);
  expect(ids).toContain('image-alt'); // <img> without alt text
  expect(ids).toContain('label'); // <input> without a label
});
