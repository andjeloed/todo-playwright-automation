import { test, expect } from './fixtures';

test('P0 filters mixed tasks by Active, Completed and All', async ({ todo }) => {
  await todo.setCompleted('Pay electric bill', true);
  await todo.filter('Active');
  await expect(todo.titles).toHaveText(['Walk the dog']);
  await expect(todo.page).toHaveURL(/#\/active$/);
  await expect(todo.page.getByRole('link', { name: 'Active', exact: true })).toHaveClass('selected');
  await todo.filter('Completed');
  await expect(todo.titles).toHaveText(['Pay electric bill']);
  await expect(todo.page).toHaveURL(/#\/completed$/);
  await expect(todo.page.getByRole('link', { name: 'Completed', exact: true })).toHaveClass('selected');
  await expect(todo.count).toHaveText('1 item left');
  await todo.filter('All');
  await expect(todo.titles).toHaveText(['Pay electric bill', 'Walk the dog']);
  await expect(todo.page).toHaveURL(/#\/$/);
  await expect(todo.page.getByRole('link', { name: 'All', exact: true })).toHaveClass('selected');
});

test('P1 updates filtered lists immediately when task status changes', async ({ todo }) => {
  await todo.filter('Active');
  await todo.setCompleted('Walk the dog', true);
  await expect(todo.titles).toHaveText(['Pay electric bill']);
  await todo.filter('Completed');
  await expect(todo.titles).toHaveText(['Walk the dog']);
  await todo.setCompleted('Walk the dog', false);
  await expect(todo.items).toHaveCount(0);
  await expect(todo.footer).toBeVisible();
  await expect(todo.count).toHaveText('2 items left');
  await todo.filter('All');
  await expect(todo.titles).toHaveText(['Pay electric bill', 'Walk the dog']);
});
