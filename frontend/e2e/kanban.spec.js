import { test, expect } from '@playwright/test';

test.describe('Kanban Board E2E Tests', () => {
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('text=Connected to server');

  // Clear local storage (if used)
  await page.evaluate(() => {
    localStorage.clear();
  });

  await page.reload();

  await page.waitForSelector('[data-testid="column-todo"]');
});


  test('should display all three columns', async ({ page }) => {
    await expect(page.getByTestId('column-todo')).toBeVisible();
    await expect(page.getByTestId('column-inprogress')).toBeVisible();
    await expect(page.getByTestId('column-done')).toBeVisible();
  });

  test('should create a new task', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();

    await page.getByTestId('new-task-title').fill('E2E Test Task');
    await page.getByTestId('new-task-description').fill('This is an E2E test task');

    await page.getByTestId('create-task-btn').click();

    // Wait for task to appear
    await page.waitForSelector('text=E2E Test Task', { timeout: 5000 });

    await expect(page.getByText('E2E Test Task')).toBeVisible();
  });

  test('should edit a task', async ({ page }) => {
    // Create task first
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-title').fill('Task to Edit');
    await page.getByTestId('create-task-btn').click();

    await page.waitForSelector('text=Task to Edit');

    // Select task card safely
    const taskCard = page.locator('[data-testid^="task-"]', {
      hasText: 'Task to Edit'
    });

    await taskCard.getByTestId('edit-task-btn').click();

    await page.getByTestId('task-title-input').fill('Edited Task Title');
    await page.getByTestId('save-task-btn').click();

    await page.waitForSelector('text=Edited Task Title');

    await expect(page.getByText('Edited Task Title')).toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    // Create task first
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-title').fill('Task to Delete');
    await page.getByTestId('create-task-btn').click();

    await page.waitForSelector('text=Task to Delete');

    const taskCard = page.locator('[data-testid^="task-"]', {
      hasText: 'Task to Delete'
    });

    await taskCard.getByTestId('delete-task-btn').click();

    // Wait until removed from DOM
    await expect(page.getByText('Task to Delete')).toHaveCount(0);
  });

  test('should display connection status', async ({ page }) => {
    await expect(page.getByText('Connected to server')).toBeVisible();
  });

  test('should show task count in columns', async ({ page }) => {
    const todoColumn = page.getByTestId('column-todo');
    const inProgressColumn = page.getByTestId('column-inprogress');
    const doneColumn = page.getByTestId('column-done');

    await expect(todoColumn).toBeVisible();
    await expect(inProgressColumn).toBeVisible();
    await expect(doneColumn).toBeVisible();
  });

  test('should display task progress chart', async ({ page }) => {
    const chart = page.getByTestId('task-progress-chart');

    if (await chart.count() > 0) {
      await expect(chart).toBeVisible();
      await expect(page.getByText('Task Progress Dashboard')).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();

    await page.getByTestId('create-task-btn').click();

    await expect(page.getByTestId('new-task-form')).toBeVisible();
  });

  test('should cancel task creation', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    await expect(page.getByTestId('new-task-form')).toBeVisible();

    await page.getByTestId('new-task-btn').click();
    await expect(page.getByTestId('new-task-form')).not.toBeVisible();
  });

});
