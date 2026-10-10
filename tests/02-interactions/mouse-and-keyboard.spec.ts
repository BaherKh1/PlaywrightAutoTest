import { test, expect } from '@playwright/test';
import { THE_INTERNET } from '../../utils/constants';

/**
 * LESSON 5 — Mouse & keyboard
 * click variants, hover, drag & drop, keyboard.press, modifiers
 */
test.use({ baseURL: THE_INTERNET });

test('hover reveals hidden content', async ({ page }) => {
  await page.goto('/hovers');
  const firstFigure = page.locator('.figure').first();
  await expect(firstFigure.getByText('name: user1')).toBeHidden();
  await firstFigure.hover();
  await expect(firstFigure.getByText('name: user1')).toBeVisible();
});

test('drag and drop', async ({ page }) => {
  await page.goto('/drag_and_drop');
  const columnA = page.locator('#column-a');
  const columnB = page.locator('#column-b');

  await columnA.dragTo(columnB);

  await expect(columnA.locator('header')).toHaveText('B');
  await expect(columnB.locator('header')).toHaveText('A');
});

test('keyboard presses', async ({ page }) => {
  await page.goto('/key_presses');
  const result = page.locator('#result');

  await page.locator('#target').press('A');
  await expect(result).toHaveText('You entered: A');

  await page.keyboard.press('Tab');
  await expect(result).toHaveText('You entered: TAB');

  await page.keyboard.press('Escape');
  await expect(result).toHaveText('You entered: ESCAPE');
});

test.describe('click variants', () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(/* html */ `
      <button id="b">Target</button><p id="out">nothing</p>
      <script>
        const b = document.getElementById('b'); const out = document.getElementById('out');
        b.addEventListener('click', (e) => out.textContent = 'click' + (e.shiftKey ? '+shift' : ''));
        b.addEventListener('dblclick', () => out.textContent = 'dblclick');
        b.addEventListener('contextmenu', (e) => { e.preventDefault(); out.textContent = 'contextmenu'; });
      </script>
    `);
  });

  test('single, double, right click and modifiers', async ({ page }) => {
    const target = page.getByRole('button', { name: 'Target' });
    const out = page.locator('#out');

    await target.click();
    await expect(out).toHaveText('click');

    await target.click({ modifiers: ['Shift'] });
    await expect(out).toHaveText('click+shift');

    await target.dblclick();
    await expect(out).toHaveText('dblclick');

    await target.click({ button: 'right' });
    await expect(out).toHaveText('contextmenu');
  });

  test('low-level mouse API', async ({ page }) => {
    const box = await page.getByRole('button', { name: 'Target' }).boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.up();
    await expect(page.locator('#out')).toHaveText('click');
  });
});
