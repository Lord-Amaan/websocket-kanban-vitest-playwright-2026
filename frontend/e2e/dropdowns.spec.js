import { test, expect } from '@playwright/test';

test.describe('Dropdown and Select Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('Connected to server').waitFor();
  });

  test('should select priority when creating task', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-title').fill('Priority Test Task');

    // Click the input inside the priority select
    await page.locator('label:has-text("Priority")').locator('..').locator('input').click();
    
    // Wait for menu to appear - it might be in portal or inline
    await page.waitForTimeout(300);
    
    // Click High option (look anywhere on page)
    await page.getByText('High', { exact: true }).click();

    await page.getByTestId('create-task-btn').click();

    // Use first() to handle potential duplicates
    const taskTitle = page.getByRole('heading', { name: 'Priority Test Task' }).first();
    await expect(taskTitle).toBeVisible();

    // Check that priority badge exists (might be "High" or "HIGH")
    const taskCard = taskTitle.locator('..');
    const hasHighPriority = await taskCard.getByText(/high/i).count() > 0;
    expect(hasHighPriority).toBeTruthy();
  });

  test('should select category when creating task', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-title').fill('Category Test Task');

    // Click the input inside the category select
    await page.locator('label:has-text("Category")').locator('..').locator('input').click();
    
    await page.waitForTimeout(300);
    
    // Click Bug option
    await page.getByText('Bug', { exact: true }).click();

    await page.getByTestId('create-task-btn').click();

    // Use first() to handle potential duplicates
    const taskTitle = page.getByRole('heading', { name: 'Category Test Task' }).first();
    await expect(taskTitle).toBeVisible();

    // Check that category badge exists (might be "Bug" or "BUG")
    const taskCard = taskTitle.locator('..');
    const hasBugCategory = await taskCard.getByText(/bug/i).count() > 0;
    expect(hasBugCategory).toBeTruthy();
  });

  test('should change priority in edit mode', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-title').fill('Edit Priority Task');
    await page.getByTestId('create-task-btn').click();

    // Use first() to handle duplicates
    const taskTitle = page.getByRole('heading', { name: 'Edit Priority Task' }).first();
    await expect(taskTitle).toBeVisible();

    // Find the task card and click edit
    const taskCard = taskTitle.locator('..');
    await taskCard.getByTestId('edit-task-btn').first().click();

    // In edit mode, click priority select input
    await taskCard.locator('label:has-text("Priority")').locator('..').locator('input').click();
    
    await page.waitForTimeout(300);
    
    // Select Low
    await page.getByText('Low', { exact: true }).click();

    // Save
    await taskCard.getByTestId('save-task-btn').first().click();

    await page.waitForTimeout(300);

    // Check that LOW priority is now shown
    const hasLowPriority = await taskCard.getByText(/low/i).count() > 0;
    expect(hasLowPriority).toBeTruthy();
  });

  test('should change category in edit mode', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-title').fill('Edit Category Task');
    await page.getByTestId('create-task-btn').click();

    // Use first() to handle duplicates
    const taskTitle = page.getByRole('heading', { name: 'Edit Category Task' }).first();
    await expect(taskTitle).toBeVisible();

    // Find the task card and click edit
    const taskCard = taskTitle.locator('..');
    await taskCard.getByTestId('edit-task-btn').first().click();

    // In edit mode, click category select input
    await taskCard.locator('label:has-text("Category")').locator('..').locator('input').click();
    
    await page.waitForTimeout(300);
    
    // Select Enhancement
    await page.getByText('Enhancement', { exact: true }).click();

    // Save
    await taskCard.getByTestId('save-task-btn').first().click();

    await page.waitForTimeout(300);

    // Check that ENHANCEMENT category is now shown
    const hasEnhancement = await taskCard.getByText(/enhancement/i).count() > 0;
    expect(hasEnhancement).toBeTruthy();
  });

  test('should display all priority options', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    
    // Click priority select input
    await page.locator('label:has-text("Priority")').locator('..').locator('input').click();
    
    await page.waitForTimeout(300);

    // Check all options are visible (anywhere on page)
    await expect(page.getByText('Low', { exact: true })).toBeVisible();
    await expect(page.getByText('Medium', { exact: true })).toBeVisible();
    await expect(page.getByText('High', { exact: true })).toBeVisible();
  });

  test('should display all category options', async ({ page }) => {
    await page.getByTestId('new-task-btn').click();
    
    // Click category select input
    await page.locator('label:has-text("Category")').locator('..').locator('input').click();
    
    await page.waitForTimeout(300);

    // Check all options are visible
    await expect(page.getByText('Bug', { exact: true })).toBeVisible();
    await expect(page.getByText('Feature', { exact: true })).toBeVisible();
    await expect(page.getByText('Enhancement', { exact: true })).toBeVisible();
  });

});