import { test, type Locator, type Page } from '@playwright/test';

export class TodoPage {
  readonly input: Locator;
  readonly items: Locator;
  readonly titles: Locator;
  readonly count: Locator;
  readonly clearCompleted: Locator;
  readonly toggleAll: Locator;
  readonly footer: Locator;

  constructor(readonly page: Page) {
    this.input = page.getByPlaceholder('What needs to be done?');
    this.items = page.locator('.todo-list > li');
    this.titles = this.items.locator('label');
    this.count = page.locator('.todo-count');
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
    this.toggleAll = page.getByLabel('Mark all as complete');
    this.footer = page.locator('.todoapp .footer');
  }

  async open(): Promise<void> {
    await test.step('Open the ToDo application', async () => {
      await this.page.goto('/todo');
    });
  }

  item(title: string): Locator {
    return this.items.filter({ has: this.page.getByText(title, { exact: true }) });
  }

  async create(...titles: string[]): Promise<void> {
    await test.step(`Create tasks: ${titles.join(', ')}`, async () => {
      for (const title of titles) {
        await this.input.fill(title);
        await this.input.press('Enter');
      }
    });
  }

  async setCompleted(title: string, completed: boolean): Promise<void> {
    await test.step(`Mark "${title}" ${completed ? 'completed' : 'active'}`, async () => {
      const checkbox = this.item(title).getByRole('checkbox');
      if (await checkbox.isChecked() !== completed) await checkbox.click();
    });
  }

  async delete(title: string): Promise<void> {
    await test.step(`Delete "${title}"`, async () => {
      const item = this.item(title);
      await item.hover();
      await item.locator('.destroy').click();
    });
  }

  async edit(title: string, replacement: string, commit: 'Enter' | 'Tab' | 'Escape' = 'Enter'): Promise<void> {
    await test.step(`${commit === 'Escape' ? 'Cancel editing' : 'Edit'} "${title}"`, async () => {
      await this.item(title).locator('label').dblclick();
      const editor = this.page.locator('.todo-list .edit');
      await editor.fill(replacement);
      await editor.press(commit);
    });
  }

  async filter(name: 'All' | 'Active' | 'Completed'): Promise<void> {
    await test.step(`Show ${name.toLowerCase()} tasks`, async () => {
      await this.page.getByRole('link', { name, exact: true }).click();
    });
  }

  async setAllCompleted(completed: boolean): Promise<void> {
    await test.step(`Mark all tasks ${completed ? 'completed' : 'active'}`, async () => {
      if (await this.toggleAll.isChecked() !== completed) {
        await this.page.locator('label[for="toggle-all"]').click();
      }
    });
  }

  async clear(): Promise<void> {
    await test.step('Clear completed tasks', async () => {
      await this.clearCompleted.click();
    });
  }
}
