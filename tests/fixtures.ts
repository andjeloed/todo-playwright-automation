import { test as base, expect } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

export const test = base.extend<{ todo: TodoPage }>({
  todo: async ({ page }, use) => {
    const todo = new TodoPage(page);
    await todo.open();
    await expect(todo.titles).toHaveText(['Pay electric bill', 'Walk the dog']);
    await base.step('Replace sample tasks with independent UI-created tasks', async () => {
      await todo.delete('Pay electric bill');
      await todo.delete('Walk the dog');
      await expect(todo.items).toHaveCount(0);
      await todo.create('Pay electric bill', 'Walk the dog');
      await expect(todo.titles).toHaveText(['Pay electric bill', 'Walk the dog']);
      await expect(todo.count).toHaveText('2 items left');
    });
    await use(todo);
  },
});
export { expect };
