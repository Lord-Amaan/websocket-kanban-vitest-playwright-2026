import { test, expect } from '@playwright/test';

test.describe('Dropdown and Select Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('Connected to server').waitFor();
  });

  test('should select priority when creating task', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-title').fill('Priority Test Task');

    // Open priority select
    await page.getByTestId('new-task-priority').click();

    // React Select renders in portal, so wait globally
    const menu = page.locator('.react-select__menu');
    await expect(menu).toBeVisible();

    await menu.getByText('High', { exact: true }).click();

    await page.getByTestId('create-task-btn').click();

    const taskTitle = page.getByRole('heading', { name: 'Priority Test Task' });
    await expect(taskTitle).toBeVisible();

    const taskCard = page.getByTestId(/task-/).filter({ has: taskTitle });
    await expect(taskCard.getByText('HIGH')).toBeVisible();
  });

  test('should select category when creating task', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-title').fill('Category Test Task');

    await page.getByTestId('new-task-category').click();

    const menu = page.locator('.react-select__menu');
    await expect(menu).toBeVisible();

    await menu.getByText('Bug', { exact: true }).click();

    await page.getByTestId('create-task-btn').click();

    const taskTitle = page.getByRole('heading', { name: 'Category Test Task' });
    await expect(taskTitle).toBeVisible();

    const taskCard = page.getByTestId(/task-/).filter({ has: taskTitle });
    await expect(taskCard.getByText('BUG')).toBeVisible();
  });

  test('should change priority in edit mode', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-title').fill('Edit Priority Task');
    await page.getByTestId('create-task-btn').click();

    const taskTitle = page.getByRole('heading', { name: 'Edit Priority Task' });
    await expect(taskTitle).toBeVisible();

    const taskCard = page.getByTestId(/task-/).filter({ has: taskTitle });

    await taskCard.getByTestId('edit-task-btn').click();

    await page.getByTestId('edit-task-priority').click();

    const menu = page.locator('.react-select__menu');
    await expect(menu).toBeVisible();

    await menu.getByText('Low', { exact: true }).click();

    await page.getByTestId('save-task-btn').click();

    await expect(taskCard.getByText('LOW')).toBeVisible();
  });

  test('should change category in edit mode', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-title').fill('Edit Category Task');
    await page.getByTestId('create-task-btn').click();

    const taskTitle = page.getByRole('heading', { name: 'Edit Category Task' });
    await expect(taskTitle).toBeVisible();

    const taskCard = page.getByTestId(/task-/).filter({ has: taskTitle });

    await taskCard.getByTestId('edit-task-btn').click();

    await page.getByTestId('edit-task-category').click();

    const menu = page.locator('.react-select__menu');
    await expect(menu).toBeVisible();

    await menu.getByText('Enhancement', { exact: true }).click();

    await page.getByTestId('save-task-btn').click();

    await expect(taskCard.getByText('ENHANCEMENT')).toBeVisible();
  });

  test('should display all priority options', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-priority').click();

    const menu = page.locator('.react-select__menu');
    await expect(menu).toBeVisible();

    await expect(menu.getByText('Low', { exact: true })).toBeVisible();
    await expect(menu.getByText('Medium', { exact: true })).toBeVisible();
    await expect(menu.getByText('High', { exact: true })).toBeVisible();
  });

  test('should display all category options', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-category').click();

    const menu = page.locator('.react-select__menu');
    await expect(menu).toBeVisible();

    await expect(menu.getByText('Bug', { exact: true })).toBeVisible();
    await expect(menu.getByText('Feature', { exact: true })).toBeVisible();
    await expect(menu.getByText('Enhancement', { exact: true })).toBeVisible();
  });

});
