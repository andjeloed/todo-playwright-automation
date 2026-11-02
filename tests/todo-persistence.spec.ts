import { test, expect } from './fixtures';

test('P1 persists additions, edits, status and deletion after reload', async ({ todo }) => {
  await todo.create('Prepare report');
  await todo.edit('Walk the dog', 'Walk the puppy');
  await todo.setCompleted('Walk the puppy', true);
  await todo.delete('Pay electric bill');
  await test.step('Reload and verify saved tasks', async () => {
    await todo.page.reload();
    await expect(todo.titles).toHaveText(['Walk the puppy', 'Prepare report']);
    await expect(todo.item('Walk the puppy').getByRole('checkbox')).toBeChecked();
    await expect(todo.item('Prepare report').getByRole('checkbox')).not.toBeChecked();
    await expect(todo.count).toHaveText('1 item left');
  });
  await todo.filter('Completed');
  await todo.page.reload();
  await expect(todo.titles).toHaveText(['Walk the puppy']);
  await expect(todo.page.getByRole('link', { name: 'Completed', exact: true })).toHaveClass('selected');
  await todo.clear();
  await todo.page.reload();
  await todo.filter('All');
  await expect(todo.titles).toHaveText(['Prepare report']);
});
