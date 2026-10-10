import type { Page } from '@playwright/test';

/**
 * A tiny fake website served ENTIRELY by Playwright's network interception.
 * No real server, no internet needed -> perfect for learning network mocking,
 * downloads, geolocation and console events in a 100% deterministic way.
 */
export const FAKE_APP_URL = 'https://fake.app';

export const DEFAULT_USERS = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' },
];

const FAKE_APP_HTML = /* html */ `
<!doctype html>
<html lang="en">
  <head><title>Fake App</title></head>
  <body>
    <main>
      <h1>Fake App</h1>
      <button id="load">Load users</button>
      <p id="status" role="status"></p>
      <ul id="users"></ul>

      <a id="download" href="/report.csv">Download report</a>

      <button id="geo">Where am I?</button>
      <p id="geo-out"></p>
    </main>
    <script>
      console.log('Fake app ready');

      document.getElementById('load').addEventListener('click', async () => {
        const status = document.getElementById('status');
        status.textContent = 'Loading...';
        try {
          const res = await fetch('/api/users');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const users = await res.json();
          const ul = document.getElementById('users');
          ul.innerHTML = '';
          for (const u of users) {
            const li = document.createElement('li');
            li.textContent = u.name;
            ul.appendChild(li);
          }
          status.textContent = 'Loaded ' + users.length + ' users';
        } catch (e) {
          status.textContent = 'Error: ' + e.message;
        }
      });

      document.getElementById('geo').addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition((p) => {
          document.getElementById('geo-out').textContent =
            p.coords.latitude.toFixed(2) + ', ' + p.coords.longitude.toFixed(2);
        });
      });
    </script>
  </body>
</html>`;

/** Registers the routes. Routes registered LATER win, so tests can override /api/users. */
export async function serveFakeApp(page: Page, users: unknown[] = DEFAULT_USERS) {
  await page.route(`${FAKE_APP_URL}/`, (route) =>
    route.fulfill({ contentType: 'text/html', body: FAKE_APP_HTML }),
  );
  await page.route(`${FAKE_APP_URL}/api/users`, (route) => route.fulfill({ json: users }));
  await page.route(`${FAKE_APP_URL}/report.csv`, (route) =>
    route.fulfill({
      status: 200,
      headers: {
        'content-type': 'text/csv',
        'content-disposition': 'attachment; filename="report.csv"',
      },
      body: 'id,name\n1,Ada\n2,Alan\n',
    }),
  );
}
