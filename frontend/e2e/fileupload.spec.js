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

    const heading = page.getByRole('heading', { name: title });
    await expect(heading).toBeVisible();

    return page.locator('[data-testid^="task-"]', {
      has: heading
    });
  }

  test('should upload an image file', async ({ page }) => {

    const title = uniqueName('ImageTask');
    const taskCard = await createTask(page, title);

    await taskCard.getByTestId('edit-task-btn').click();

    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    await page.getByTestId('file-upload-input').setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer,
    });

    // wait for uploading text to disappear
    await page.waitForTimeout(1500);

    await page.getByTestId('save-task-btn').click();

    await expect(
      taskCard.locator('img[alt="test-image.png"]')
    ).toBeVisible();
  });

  test('should reject invalid file types', async ({ page }) => {

    const title = uniqueName('InvalidFile');
    const taskCard = await createTask(page, title);

    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Invalid file type');
      dialog.accept();
    });

    await taskCard.getByTestId('edit-task-btn').click();

    await page.getByTestId('file-upload-input').setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('test content'),
    });
  });

  test('should upload PDF file', async ({ page }) => {

    const title = uniqueName('PDFTask');
    const taskCard = await createTask(page, title);

    await taskCard.getByTestId('edit-task-btn').click();

    const pdfBuffer = Buffer.from(
      '%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\nxref\n0 1\n0000000000 65535 f\ntrailer<</Size 1/Root 1 0 R>>\nstartxref\n0\n%%EOF'
    );

    await page.getByTestId('file-upload-input').setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });

    await page.waitForTimeout(1500);

    await page.getByTestId('save-task-btn').click();

    await expect(
      taskCard.getByText('test-document.pdf')
    ).toBeVisible();
  });

  test('should display multiple attachments', async ({ page }) => {

    const title = uniqueName('MultiAttach');
    const taskCard = await createTask(page, title);

    await taskCard.getByTestId('edit-task-btn').click();

    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    await page.getByTestId('file-upload-input').setInputFiles({
      name: 'image1.png',
      mimeType: 'image/png',
      buffer,
    });

    await page.waitForTimeout(1000);

    await page.getByTestId('file-upload-input').setInputFiles({
      name: 'image2.png',
      mimeType: 'image/png',
      buffer,
    });

    await page.waitForTimeout(1500);

    await expect(
      taskCard.locator('img[alt*=".png"]')
    ).toHaveCount(2);
  });

  test('should remove attachment', async ({ page }) => {

    const title = uniqueName('RemoveAttach');
    const taskCard = await createTask(page, title);

    await taskCard.getByTestId('edit-task-btn').click();

    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    await page.getByTestId('file-upload-input').setInputFiles({
      name: 'to-remove.png',
      mimeType: 'image/png',
      buffer,
    });

    await page.waitForTimeout(1500);

    const removeBtn = taskCard.locator('button', { hasText: '×' }).first();
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    await expect(
      taskCard.locator('img[alt="to-remove.png"]')
    ).toHaveCount(0);
  });

});
