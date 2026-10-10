import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage, type SortOption } from '../../pages/InventoryPage';
import { STORAGE_STATE } from '../../utils/constants';
import loginCases from '../../test-data/login-cases.json';

/**
 * LESSON 13 — Data-driven tests
 * Plain JavaScript loops generate one separate test per data row. Each shows up
 * individually in the report and can fail / retry on its own.
 */

// 1) Data from an external JSON file
test.describe('invalid logins (from JSON)', () => {
  for (const { name, username, password, error } of loginCases) {
    test(`login fails: ${name}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(username, password);
      await loginPage.expectError(error);
    });
  }
});

// 2) Data defined inline, with a verification function per row
const sortCases: Array<{ option: SortOption; description: string; isSorted: (a: string[] | number[]) => boolean }> = [
  { option: 'az', description: 'name A to Z', isSorted: (v) => JSON.stringify(v) === JSON.stringify([...(v as string[])].sort()) },
  { option: 'za', description: 'name Z to A', isSorted: (v) => JSON.stringify(v) === JSON.stringify([...(v as string[])].sort().reverse()) },
  { option: 'lohi', description: 'price low to high', isSorted: (v) => JSON.stringify(v) === JSON.stringify([...(v as number[])].sort((a, b) => a - b)) },
  { option: 'hilo', description: 'price high to low', isSorted: (v) => JSON.stringify(v) === JSON.stringify([...(v as number[])].sort((a, b) => b - a)) },
];

test.describe('product sorting', () => {
  test.use({ storageState: STORAGE_STATE });

  for (const { option, description, isSorted } of sortCases) {
    test(`sort by ${description}`, async ({ page }) => {
      const inventory = new InventoryPage(page);
      await inventory.goto();
      await inventory.sortBy(option);

      const values = option === 'az' || option === 'za' ? await inventory.getNames() : await inventory.getPrices();
      expect(isSorted(values)).toBe(true);
    });
  }
});
