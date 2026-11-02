# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: todo-known-defect.spec.ts >> P1 known defect: completing the second sample task leaves the first active
- Location: tests/todo-known-defect.spec.ts:4:5

# Error details

```
Error: expect(locator).toHaveClass(expected) failed

Locator:  locator('.todo-list > li').filter({ has: getByText('Walk the dog', { exact: true }) })
Expected: "completed"
Received: ""
Timeout:  5000ms

Call log:
  - Expect "toHaveClass" locator('.todo-list > li').filter({ has: getByText('Walk the dog', { exact: true }) }) with timeout 5000ms
  - waiting for locator('.todo-list > li').filter({ has: getByText('Walk the dog', { exact: true }) })
    14 × locator resolved to <li class="" data-id="1793620800000">…</li>
       - unexpected value ""

```

```yaml
- listitem:
  - checkbox [checked]
  - text: Walk the dog
  - button "×"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { TodoPage } from '../pages/TodoPage';
  3  | 
  4  | test('P1 known defect: completing the second sample task leaves the first active', async ({ page }) => {
  5  |   await page.clock.setFixedTime(new Date('2026-11-02T12:00:00Z'));
  6  |   const todo = new TodoPage(page);
  7  |   await todo.open();
  8  |   await expect(todo.titles).toHaveText(['Pay electric bill', 'Walk the dog']);
  9  |   await test.step('Capture sample task IDs', async () => {
  10 |     const ids = await todo.items.evaluateAll(items => items.map(item => item.getAttribute('data-id')));
  11 |     await test.info().attach('sample-task-ids', { body: JSON.stringify(ids), contentType: 'application/json' });
  12 |   });
  13 |   await todo.setCompleted('Walk the dog', true);
  14 |   await expect(todo.titles).toHaveText(['Pay electric bill', 'Walk the dog']);
  15 |   await test.info().attach('QA-001-incorrect-completion', {
  16 |     body: await page.screenshot(), contentType: 'image/png',
  17 |   });
  18 |   await test.info().attach('QA-001-saved-state', {
  19 |     body: await page.evaluate(() => localStorage.getItem('todos-vanillajs') ?? 'null'),
  20 |     contentType: 'application/json',
  21 |   });
  22 |   test.fail(true, 'QA-001: sample tasks share a timestamp ID; see FINDINGS.md and docs/issues/QA-001.md');
> 23 |   await expect(todo.item('Walk the dog')).toHaveClass('completed');
     |                                           ^ Error: expect(locator).toHaveClass(expected) failed
  24 |   await expect(todo.item('Pay electric bill').getByRole('checkbox')).not.toBeChecked();
  25 | });
  26 | 
```