import { test, expect } from '@playwright/test';
import { THE_INTERNET } from '../../utils/constants';

/**
 * LESSON 4 — Form controls
 * fill / clear / pressSequentially / selectOption / check / uncheck / setChecked
 * Practice site: https://the-internet.herokuapp.com
 */
test.use({ baseURL: THE_INTERNET }); // test.use overrides config options for this file

test('select a dropdown option (by value, label and index)', async ({ page }) => {
  await page.goto('/dropdown');
  const dropdown = page.locator('#dropdown');

  await dropdown.selectOption('1'); // by value
  await expect(dropdown).toHaveValue('1');

  await dropdown.selectOption({ label: 'Option 2' });
  await expect(dropdown).toHaveValue('2');

  await dropdown.selectOption({ index: 1 });
  await expect(dropdown).toHaveValue('1');
});

test('check and uncheck checkboxes', async ({ page }) => {
  await page.goto('/checkboxes');
  const boxes = page.getByRole('checkbox');

  await expect(boxes.first()).not.toBeChecked();
  await expect(boxes.last()).toBeChecked();

  await boxes.first().check();
  await boxes.last().uncheck();
  await expect(boxes.first()).toBeChecked();
  await expect(boxes.last()).not.toBeChecked();

  await boxes.first().setChecked(false); // set to a specific state, whatever it is now
  await expect(boxes.first()).not.toBeChecked();
});

test.describe('a self-contained form', () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(/* html */ `
      <form id="f">
        <label>Name <input name="name" /></label>
        <label>Bio <textarea name="bio"></textarea></label>
        <label>Birthday <input type="date" name="bday" /></label>
        <fieldset>
          <legend>Plan</legend>
          <label><input type="radio" name="plan" value="free" /> Free</label>
          <label><input type="radio" name="plan" value="pro" /> Pro</label>
        </fieldset>
        <label>Languages
          <select name="langs" multiple>
            <option value="ts">TypeScript</option><option value="py">Python</option><option value="go">Go</option>
          </select>
        </label>
        <button type="submit">Send</button>
      </form>
      <pre id="out"></pre>
      <script>
        document.getElementById('f').addEventListener('submit', (e) => {
          e.preventDefault();
          const d = new FormData(e.target);
          document.getElementById('out').textContent =
            JSON.stringify({ name: d.get('name'), bio: d.get('bio'), bday: d.get('bday'),
                             plan: d.get('plan'), langs: d.getAll('langs') });
        });
      </script>
    `);
  });

  test('fill every kind of input and submit', async ({ page }) => {
    await page.getByLabel('Name').fill('Ada');
    await page.getByLabel('Bio').fill('First programmer');
    await page.getByLabel('Birthday').fill('1815-12-10'); // date inputs need ISO format
    await page.getByLabel('Pro').check(); // radio buttons use check()
    await page.getByLabel('Languages').selectOption(['ts', 'py']); // multi-select takes an array
    await page.getByRole('button', { name: 'Send' }).click();

    const result = JSON.parse((await page.locator('#out').textContent()) ?? '{}');
    expect(result).toEqual({ name: 'Ada', bio: 'First programmer', bday: '1815-12-10', plan: 'pro', langs: ['ts', 'py'] });
  });

  test('clear, type like a human, read values back', async ({ page }) => {
    const name = page.getByLabel('Name');
    await name.fill('temp');
    await name.clear();
    await expect(name).toBeEmpty();

    await name.pressSequentially('Grace', { delay: 50 }); // fires real key events (use when fill() isn't enough)
    expect(await name.inputValue()).toBe('Grace');
  });
});
