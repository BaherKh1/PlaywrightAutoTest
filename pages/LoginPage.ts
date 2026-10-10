import { expect, type Locator, type Page } from '@playwright/test';

/**
 * PAGE OBJECT MODEL (POM)
 * One class per page: locators + actions live here, assertions about "what the
 * test means" live in the spec. Tests become short and readable, and when the UI
 * changes you fix ONE file instead of fifty tests.
 */
export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.error = page.getByTestId('error');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async expectError(message: string) {
    await expect(this.error).toHaveText(message);
  }
}
