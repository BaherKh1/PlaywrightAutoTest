import { type Locator, type Page } from '@playwright/test';

/** Page object for https://demo.playwright.dev/todomvc (uses data-testid, not data-test). */
export class TodoPage {
  readonly newTodo: Locator;
  readonly items: Locator;
  readonly titles: Locator;
  readonly count: Locator;
  readonly clearCompleted: Locator;

  constructor(private readonly page: Page) {
    this.newTodo = page.getByPlaceholder('What needs to be done?');
    this.items = page.getByTestId('todo-item');
    this.titles = page.getByTestId('todo-title');
    this.count = page.getByTestId('todo-count');
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
  }

  async goto() {
    await this.page.goto('/todomvc');
  }

  async add(...texts: string[]) {
    for (const text of texts) {
      await this.newTodo.fill(text);
      await this.newTodo.press('Enter');
    }
  }

  item(text: string): Locator {
    return this.items.filter({ hasText: text });
  }

  async toggle(text: string) {
    await this.item(text).getByRole('checkbox', { name: 'Toggle Todo' }).check();
  }

  async remove(text: string) {
    const item = this.item(text);
    await item.hover(); // the delete button only appears on hover
    await item.locator('button.destroy').click();
  }

  async edit(oldText: string, newText: string) {
    const item = this.item(oldText);
    await item.getByTestId('todo-title').dblclick();
    const editor = item.getByRole('textbox', { name: 'Edit' });
    await editor.fill(newText);
    await editor.press('Enter');
  }

  async filter(name: 'All' | 'Active' | 'Completed') {
    await this.page.getByRole('link', { name }).click();
  }
}
