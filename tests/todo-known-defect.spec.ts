import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

test('P1 known defect: completing the second sample task leaves the first active', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-02T12:00:00Z'));
  const todo = new TodoPage(page);
  await todo.open();
  await expect(todo.titles).toHaveText(['Pay electric bill', 'Walk the dog']);
  await test.step('Capture sample task IDs', async () => {
    const ids = await todo.items.evaluateAll(items => items.map(item => item.getAttribute('data-id')));
    await test.info().attach('sample-task-ids', { body: JSON.stringify(ids), contentType: 'application/json' });
  });
  await todo.setCompleted('Walk the dog', true);
  await expect(todo.titles).toHaveText(['Pay electric bill', 'Walk the dog']);
  await test.info().attach('QA-001-incorrect-completion', {
    body: await page.screenshot(), contentType: 'image/png',
  });
  await test.info().attach('QA-001-saved-state', {
    body: await page.evaluate(() => localStorage.getItem('todos-vanillajs') ?? 'null'),
    contentType: 'application/json',
  });
  test.fail(true, 'QA-001: sample tasks share a timestamp ID; see FINDINGS.md and docs/issues/QA-001.md');
  await expect(todo.item('Walk the dog')).toHaveClass('completed');
  await expect(todo.item('Pay electric bill').getByRole('checkbox')).not.toBeChecked();
});
