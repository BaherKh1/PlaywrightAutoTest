import { test, expect } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage';
import { TODOMVC } from '../../utils/constants';

// This app uses data-testid (Playwright's default), our config uses data-test.
// test.use() overrides it for this file only.
test.use({ baseURL: TODOMVC, testIdAttribute: 'data-testid' });

test.describe('TodoMVC', () => {
  let todo: TodoPage;

  test.beforeEach(async ({ page }) => {
    todo = new TodoPage(page);
    await todo.goto();
  });

  test('add todos', async () => {
    await todo.add('buy milk', 'write tests');
    await expect(todo.titles).toHaveText(['buy milk', 'write tests']);
    await expect(todo.count).toContainText('2');
  });

  test('complete a todo and filter lists', async () => {
    await todo.add('buy milk', 'write tests');
    await todo.toggle('buy milk');

    await todo.filter('Active');
    await expect(todo.titles).toHaveText(['write tests']);

    await todo.filter('Completed');
    await expect(todo.titles).toHaveText(['buy milk']);

    await todo.filter('All');
    await expect(todo.items).toHaveCount(2);
  });

  test('edit and delete', async () => {
    await todo.add('buy milk', 'write tests');

    await todo.edit('buy milk', 'buy oat milk');
    await expect(todo.titles).toHaveText(['buy oat milk', 'write tests']);

    await todo.remove('write tests');
    await expect(todo.items).toHaveCount(1);
  });

  test('clear completed', async () => {
    await todo.add('a', 'b', 'c');
    await todo.toggle('a');
    await todo.toggle('b');
    await todo.clearCompleted.click();
    await expect(todo.titles).toHaveText(['c']);
  });
});
