import { test, expect } from '@playwright/test';
import fs from 'fs';
import { THE_INTERNET } from '../../utils/constants';
import { FAKE_APP_URL, serveFakeApp } from '../../utils/fakeApp';

/**
 * LESSON 6 — Dialogs, file uploads, file downloads
 */
test.describe('JavaScript dialogs (alert / confirm / prompt)', () => {
  test.use({ baseURL: THE_INTERNET });

  // Playwright AUTO-DISMISSES dialogs. Register a handler BEFORE the click if you care about them.
  test('alert', async ({ page }) => {
    await page.goto('/javascript_alerts');
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toBe('I am a JS Alert');
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Click for JS Alert' }).click();
    await expect(page.locator('#result')).toHaveText('You successfully clicked an alert');
  });

  test('confirm: accept and dismiss', async ({ page }) => {
    await page.goto('/javascript_alerts');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Click for JS Confirm' }).click();
    await expect(page.locator('#result')).toHaveText('You clicked: Ok');

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: 'Click for JS Confirm' }).click();
    await expect(page.locator('#result')).toHaveText('You clicked: Cancel');
  });

  test('prompt', async ({ page }) => {
    await page.goto('/javascript_alerts');
    page.once('dialog', (dialog) => dialog.accept('Playwright'));
    await page.getByRole('button', { name: 'Click for JS Prompt' }).click();
    await expect(page.locator('#result')).toHaveText('You entered: Playwright');
  });
});

test.describe('file upload', () => {
  test.use({ baseURL: THE_INTERNET });

  test('setInputFiles with a real file on disk', async ({ page }, testInfo) => {
    const filePath = testInfo.outputPath('hello.txt'); // folder is created for you
    fs.writeFileSync(filePath, 'Hello from Playwright');

    await page.goto('/upload');
    await page.locator('#file-upload').setInputFiles(filePath);
    await page.locator('#file-submit').click();

    await expect(page.getByRole('heading', { name: 'File Uploaded!' })).toBeVisible();
    await expect(page.locator('#uploaded-files')).toHaveText('hello.txt');
  });

  test('setInputFiles with an in-memory buffer (no file needed)', async ({ page }) => {
    await page.goto('/upload');
    await page.locator('#file-upload').setInputFiles({
      name: 'memory.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('created in memory'),
    });
    await page.locator('#file-submit').click();
    await expect(page.locator('#uploaded-files')).toHaveText('memory.txt');
  });

  test('handle the native file chooser dialog', async ({ page }, testInfo) => {
    const filePath = testInfo.outputPath('chooser.txt');
    fs.writeFileSync(filePath, 'via file chooser');

    await page.goto('/upload');
    const fileChooserPromise = page.waitForEvent('filechooser'); // start waiting BEFORE the click
    await page.locator('#file-upload').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    await page.locator('#file-submit').click();
    await expect(page.locator('#uploaded-files')).toHaveText('chooser.txt');
  });
});

test.describe('file download', () => {
  test('wait for the download event, then inspect the file', async ({ page }, testInfo) => {
    await serveFakeApp(page);
    await page.goto(FAKE_APP_URL);

    const downloadPromise = page.waitForEvent('download'); // wait first, click second
    await page.getByRole('link', { name: 'Download report' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('report.csv');

    const savedTo = testInfo.outputPath('report.csv');
    await download.saveAs(savedTo);
    expect(fs.readFileSync(savedTo, 'utf-8')).toContain('1,Ada');
  });
});
