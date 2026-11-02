import { test, expect } from './fixtures';

test('P0 completes and reactivates a task with accurate counts', async ({ todo }) => {
  await expect(todo.clearCompleted).toBeHidden();
  await todo.setCompleted('Walk the dog', true);
  await expect(todo.item('Walk the dog')).toHaveClass('completed');
  await expect(todo.item('Walk the dog').getByRole('checkbox')).toBeChecked();
  await expect(todo.count).toHaveText('1 item left');
  await expect(todo.clearCompleted).toBeVisible();
  await todo.setCompleted('Walk the dog', false);
  await expect(todo.item('Walk the dog').getByRole('checkbox')).not.toBeChecked();
  await expect(todo.item('Walk the dog')).not.toHaveClass('completed');
  await expect(todo.count).toHaveText('2 items left');
  await expect(todo.clearCompleted).toBeHidden();
});

test('P0 clears completed tasks while retaining active tasks', async ({ todo }) => {
  await todo.setCompleted('Pay electric bill', true);
  await todo.clear();
  await expect(todo.titles).toHaveText(['Walk the dog']);
  await expect(todo.count).toHaveText('1 item left');
  await expect(todo.clearCompleted).toBeHidden();
});

test('P1 marks all tasks completed and then active', async ({ todo }) => {
  await todo.setCompleted('Pay electric bill', true);
  await todo.setAllCompleted(true);
  await expect(todo.items.locator('input:checked')).toHaveCount(2);
  await expect(todo.toggleAll).toBeChecked();
  await expect(todo.count).toHaveText('0 items left');
  await todo.setAllCompleted(false);
  await expect(todo.items.locator('input:checked')).toHaveCount(0);
  await expect(todo.toggleAll).not.toBeChecked();
  await expect(todo.count).toHaveText('2 items left');
});

test('P2 hides list controls when empty and allows creating a task again', async ({ todo }) => {
  await todo.setAllCompleted(true);
  await todo.clear();
  await expect(todo.items).toHaveCount(0);
  await expect(todo.footer).toBeHidden();
  await expect(todo.toggleAll).toBeHidden();
  await expect(todo.clearCompleted).toBeHidden();
  await expect(todo.input).toBeVisible();
  await todo.create('Start again');
  await expect(todo.titles).toHaveText(['Start again']);
  await expect(todo.count).toHaveText('1 item left');
});
