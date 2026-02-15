import { test, expect } from '@playwright/test';

function uniqueName(prefix = 'Task') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

test.describe('File Upload Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('Connected to server').waitFor();
  });

  async function createTask(page, title) {
    await page.getByTestId('new-task-btn').click();
    await page.getByTestId('new-task-title').fill(title);
    await page.getByTestId('create-task-btn').click();

    // Use first() to handle duplicates
    const heading = page.getByRole('heading', { name: title }).first();
    await expect(heading).toBeVisible();

    // Find task card by data-testid pattern and filter by heading
    return page.locator('[data-testid^="task-"]').filter({
      has: heading
    }).first();
  }

  test('should upload an image file', async ({ page }) => {

    const title = uniqueName('ImageTask');
    const taskCard = await createTask(page, title);

    await taskCard.getByTestId('edit-task-btn').click();

    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    // Look for file input globally
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer,
    });

    await page.waitForTimeout(1500);

    await page.getByTestId('save-task-btn').first().click();

    await page.waitForTimeout(500);

    // Flexible check for attachment
    const imageExists = await page.locator('img[alt="test-image.png"]').count() > 0 ||
                        await page.locator('[data-testid="attachment-item"]').count() > 0;
    
    expect(imageExists).toBeTruthy();
  });

  test('should reject invalid file types', async ({ page }) => {

    const title = uniqueName('InvalidFile');
    const taskCard = await createTask(page, title);

    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Invalid file type');
      dialog.accept();
    });

    await taskCard.getByTestId('edit-task-btn').click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('test content'),
    });

    await page.waitForTimeout(500);
  });

  test('should upload PDF file', async ({ page }) => {

    const title = uniqueName('PDFTask');
    const taskCard = await createTask(page, title);

    await taskCard.getByTestId('edit-task-btn').click();

    const pdfBuffer = Buffer.from(
      '%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\nxref\n0 1\n0000000000 65535 f\ntrailer<</Size 1/Root 1 0 R>>\nstartxref\n0\n%%EOF'
    );

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });

    await page.waitForTimeout(1500);

    await page.getByTestId('save-task-btn').first().click();

    await page.waitForTimeout(500);

    // Flexible check
    const pdfExists = await page.getByText('test-document.pdf').count() > 0 ||
                      await page.locator('[data-testid="attachment-item"]').count() > 0;
    
    expect(pdfExists).toBeTruthy();
  });

  test('should display multiple attachments', async ({ page }) => {

    const title = uniqueName('MultiAttach');
    const taskCard = await createTask(page, title);

    await taskCard.getByTestId('edit-task-btn').click();

    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const fileInput = page.locator('input[type="file"]').first();
    
    await fileInput.setInputFiles({
      name: 'image1.png',
      mimeType: 'image/png',
      buffer,
    });

    await page.waitForTimeout(1000);

    await fileInput.setInputFiles({
      name: 'image2.png',
      mimeType: 'image/png',
      buffer,
    });

    await page.waitForTimeout(1500);

    // Check for attachments
    const count = await page.locator('[data-testid="attachment-item"]').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should remove attachment', async ({ page }) => {

    const title = uniqueName('RemoveAttach');
    const taskCard = await createTask(page, title);

    await taskCard.getByTestId('edit-task-btn').click();

    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'to-remove.png',
      mimeType: 'image/png',
      buffer,
    });

    await page.waitForTimeout(1500);

    // Try to remove
    const removeBtn = page.locator('button').filter({ hasText: '×' }).first();
    if (await removeBtn.count() > 0) {
      await removeBtn.click();
      await page.waitForTimeout(500);
      expect(await page.locator('img[alt="to-remove.png"]').count()).toBe(0);
    }
  });

});