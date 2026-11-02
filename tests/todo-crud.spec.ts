import { test, expect } from './fixtures';

test('P0 creates multiple tasks in order and trims surrounding spaces', async ({ todo }) => {
  await todo.create('  Prepare assessment  ', 'Review results');
  await expect(todo.titles).toHaveText(['Pay electric bill', 'Walk the dog', 'Prepare assessment', 'Review results']);
  await expect(todo.input).toBeEmpty();
  await expect(todo.item('Prepare assessment').getByRole('checkbox')).not.toBeChecked();
  await expect(todo.count).toHaveText('4 items left');
});

test('P0 deletes only the selected task', async ({ todo }) => {
  await todo.delete('Pay electric bill');
  await expect(todo.titles).toHaveText(['Walk the dog']);
  await expect(todo.count).toHaveText('1 item left');
});

test('P1 edits a task using Enter and blur without changing its status', async ({ todo }) => {
  await todo.setCompleted('Pay electric bill', true);
  await todo.edit('Pay electric bill', '  Pay gas bill  ');
  await expect(todo.titles).toHaveText(['Pay gas bill', 'Walk the dog']);
  await expect(todo.item('Pay gas bill').getByRole('checkbox')).toBeChecked();
  await todo.edit('Walk the dog', 'Walk in the park', 'Tab');
  await expect(todo.titles).toHaveText(['Pay gas bill', 'Walk in the park']);
  await expect(todo.item('Walk in the park').getByRole('checkbox')).not.toBeChecked();
  await expect(todo.count).toHaveText('1 item left');
});

test('P2 rejects empty and whitespace-only new tasks', async ({ todo }) => {
  await todo.input.press('Enter');
  await todo.create('   ');
  await expect(todo.titles).toHaveText(['Pay electric bill', 'Walk the dog']);
  await expect(todo.count).toHaveText('2 items left');
});

test('P2 accepts duplicate titles as separate tasks', async ({ todo }) => {
  await todo.create('Review', 'Review');
  await expect(todo.item('Review')).toHaveCount(2);
  await expect(todo.count).toHaveText('4 items left');
});

test('P2 cancels an edit with Escape', async ({ todo }) => {
  await todo.edit('Walk the dog', 'Discard this change', 'Escape');
  await expect(todo.titles).toHaveText(['Pay electric bill', 'Walk the dog']);
  await expect(todo.page.locator('.edit')).toHaveCount(0);
  await todo.page.reload();
  await expect(todo.titles).toHaveText(['Pay electric bill', 'Walk the dog']);
});

test('P2 editing to whitespace removes the task', async ({ todo }) => {
  await todo.edit('Walk the dog', '   ');
  await expect(todo.titles).toHaveText(['Pay electric bill']);
  await expect(todo.count).toHaveText('1 item left');
});
