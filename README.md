# Playwright Learning Project (TypeScript)

A hands-on project that walks you through everything you need to know about Playwright.
Each folder under `tests/` is a **lesson**; read the comments at the top of each file, run it,
then break it on purpose and see what happens.

## 1. Setup

```bash
npm install
npx playwright install --with-deps   # downloads Chromium, Firefox and WebKit
cp .env.example .env                  # optional
```

Requires Node.js 18+.

## 2. Commands you will use every day

| Command | What it does |
|---|---|
| `npm test` | Run everything in Chromium (headless) |
| `npm run test:ui` | **UI mode**: time-travel debugger, watch mode, locator picker. Start here! |
| `npm run test:headed` | Watch the browser while tests run |
| `npm run test:debug` | Step through with the Playwright Inspector |
| `npm run test:smoke` | Only tests tagged `@smoke` |
| `npm run test:all-browsers` | Chromium + Firefox + WebKit (+ mobile project for `@mobile` tests) |
| `npm run codegen` | Record your actions and get test code |
| `npm run report` | Open the HTML report |
| `npx playwright test tests/01-basics` | Run one folder |
| `npx playwright test -g "login"` | Run tests whose title matches |
| `npx playwright test file.spec.ts:25` | Run the test at line 25 |
| `npm run list` | List all tests without running them |

## 3. The learning path

| # | Folder | You will learn |
|---|---|---|
| 1 | `01-basics` | First test, **all locator types**, web-first assertions, soft assertions, `expect.poll`, `toPass` |
| 2 | `02-interactions` | Forms, dropdowns, checkboxes, radios, hover, drag & drop, keyboard, dialogs, **file upload & download** |
| 3 | `03-waiting` | **Auto-waiting**, explicit waits, waiting for network, the Clock API |
| 4 | `04-page-object-model` | **Page Object Model**, `test.step`, end-to-end flows |
| 5 | `05-fixtures` | **Custom fixtures**, option fixtures, auto fixtures |
| 6 | `06-api` | **API testing** with the `request` fixture (GET/POST/PUT/PATCH/DELETE) |
| 7 | `07-network` | **Mocking**: fulfill, override, delay, abort, assert on requests |
| 8 | `08-auth` | **Storage state** login reuse, isolated contexts, basic auth |
| 9 | `09-data-driven` | Parameterised tests from inline data and JSON |
| 10 | `10-organization` | Hooks, tags, annotations (`skip`, `fixme`, `fail`, `slow`), parallel vs serial |
| 11 | `11-visual` | **Screenshot comparison**, masking, ARIA snapshots |
| 12 | `12-advanced` | iframes, new tabs/popups, Shadow DOM, emulation (locale, timezone, geolocation, dark mode, mobile), **accessibility (axe)** |
| 13 | `13-debugging` | Console/network listeners, traces, Inspector, attachments |

Supporting code:

- `playwright.config.ts`: **heavily commented**; read it carefully. Projects, retries, timeouts, reporters, trace/video/screenshot settings, setup & teardown projects.
- `pages/`: page objects. `fixtures/index.ts`: custom fixtures.
- `tests/auth.setup.ts` + `tests/cleanup.teardown.ts`: project dependencies (the modern replacement for globalSetup/globalTeardown).
- `utils/fakeApp.ts`: a fake website served purely by network interception, so some lessons work with no internet.
- `test-data/`, `utils/data-factory.ts`: static data and faker-generated data.
- `.github/workflows/playwright.yml`: CI that runs the suite and uploads the report.

## 4. Practice sites used

- https://www.saucedemo.com (login, shopping, checkout)
- https://the-internet.herokuapp.com (classic automation scenarios)
- https://demo.playwright.dev/todomvc (TodoMVC)
- https://jsonplaceholder.typicode.com (fake REST API)

These are third-party sites. If one is down or changes, tests against it can fail through no fault of yours.

## 5. Things to know

- **Visual tests fail on the very first run.** There is no baseline image yet, so Playwright writes one and fails.
  Run again and they pass. Refresh baselines with `npm run test:update-snapshots`.
- **`npm test` runs Chromium only** for speed. Use `npm run test:all-browsers` for the full matrix.
- Tests marked `test.fail`, `test.skip` and `test.fixme` in lesson 10 are *supposed* to be reported that way.
- The saved login session lives in `playwright/.auth/user.json` (git-ignored) and is deleted by the teardown project.

## 6. Golden rules

1. Prefer user-facing locators (`getByRole`, `getByLabel`, `getByText`); CSS/XPath last.
2. Use **web-first assertions** (`await expect(locator)...`) and never `waitForTimeout`.
3. Keep tests **independent**: each one sets up its own state.
4. Don't test third-party sites in your real suite; mock them (lesson 7).
5. Log in once (storage state), not in every test.
6. Put locators in page objects, assertions in tests.
7. Use `trace: 'on-first-retry'` in CI and the Trace Viewer to diagnose failures.

## 7. Exercises (do these after the lessons)

1. Write a test that sorts products and checks the **first** item name for each option.
2. Add a `ProductDetailPage` object (click a product name) and test the "Add to cart" button there.
3. Mock `/api/users` so it returns 50 users and assert the list count.
4. Add a fixture `cartWithItems` that logs in through storage state and pre-fills the cart.
5. Test `problem_user` and find a real bug using screenshots.
6. Record a flow with `codegen`, then refactor it into a page object.
7. Add a new project to the config that runs only `@smoke` tests on Firefox.
8. Make the CI workflow shard tests across 3 machines (`--shard=1/3`).

## 8. Where to go next

Official docs: https://playwright.dev/docs/intro, plus the VS Code extension "Playwright Test for VSCode",
sharding, `blob` reporter + merge reports, component testing, and the Playwright MCP server.
