import { test, expect } from '@playwright/test';
import { FAKE_APP_URL, serveFakeApp } from '../../utils/fakeApp';

/**
 * LESSON 11 — Network interception & mocking
 * page.route(urlPattern, handler) lets you fulfill, modify, delay or abort ANY request.
 * Use it to test error states, empty states and slow networks that are hard to reproduce for real.
 *
 * Rule: when several routes match, the one registered LAST wins.
 */
test.beforeEach(async ({ page }) => {
  await serveFakeApp(page); // default: serves the fake page + 2 users
});

test('happy path: the default (mocked) data renders', async ({ page }) => {
  await page.goto(FAKE_APP_URL);
  await page.getByRole('button', { name: 'Load users' }).click();

  await expect(page.getByRole('listitem')).toHaveText(['Ada Lovelace', 'Alan Turing']);
  await expect(page.getByRole('status')).toHaveText('Loaded 2 users');
});

test('override the response with your own data', async ({ page }) => {
  await page.route(`${FAKE_APP_URL}/api/users`, (route) =>
    route.fulfill({ json: [{ id: 9, name: 'Grace Hopper' }] }),
  );
  await page.goto(FAKE_APP_URL);
  await page.getByRole('button', { name: 'Load users' }).click();

  await expect(page.getByRole('listitem')).toHaveText(['Grace Hopper']);
});

test('empty state', async ({ page }) => {
  await page.route(`${FAKE_APP_URL}/api/users`, (route) => route.fulfill({ json: [] }));
  await page.goto(FAKE_APP_URL);
  await page.getByRole('button', { name: 'Load users' }).click();

  await expect(page.getByRole('status')).toHaveText('Loaded 0 users');
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('server error (HTTP 500)', async ({ page }) => {
  await page.route(`${FAKE_APP_URL}/api/users`, (route) =>
    route.fulfill({ status: 500, json: { message: 'boom' } }),
  );
  await page.goto(FAKE_APP_URL);
  await page.getByRole('button', { name: 'Load users' }).click();

  await expect(page.getByRole('status')).toHaveText('Error: HTTP 500');
});

test('network failure (request aborted)', async ({ page }) => {
  await page.route(`${FAKE_APP_URL}/api/users`, (route) => route.abort('failed'));
  await page.goto(FAKE_APP_URL);
  await page.getByRole('button', { name: 'Load users' }).click();

  await expect(page.getByRole('status')).toContainText('Error:');
});

test('slow network: the loading state is visible', async ({ page }) => {
  await page.route(`${FAKE_APP_URL}/api/users`, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000)); // simulate latency
    await route.fulfill({ json: [{ id: 1, name: 'Ada Lovelace' }] });
  });
  await page.goto(FAKE_APP_URL);
  await page.getByRole('button', { name: 'Load users' }).click();

  await expect(page.getByRole('status')).toHaveText('Loading...');
  await expect(page.getByRole('status')).toHaveText('Loaded 1 users');
});

test('assert on the outgoing request', async ({ page }) => {
  await page.goto(FAKE_APP_URL);

  const [request] = await Promise.all([
    page.waitForRequest('**/api/users'),
    page.getByRole('button', { name: 'Load users' }).click(),
  ]);

  expect(request.method()).toBe('GET');
  expect(request.url()).toBe(`${FAKE_APP_URL}/api/users`);
});

test('block heavy resources on a REAL site to speed tests up', async ({ page }) => {
  await page.route('**/*.{png,jpg,jpeg,gif,svg,webp}', (route) => route.abort());
  await page.goto('https://www.saucedemo.com/');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

/*
 * MORE TO EXPLORE (see the docs):
 *  - route.fetch() + route.fulfill({ response, body }) => call the real API, then tweak the result
 *  - page.routeFromHAR('x.har', { update: true }) => record real traffic once, replay it forever
 *  - context.route() => apply a mock to every page in the context
 */
