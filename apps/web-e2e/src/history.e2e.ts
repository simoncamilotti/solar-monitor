import { uniqueUser } from '@repo/e2e-support';

import { expect, test } from './fixtures.js';

test.describe('History page', () => {
  test.beforeEach(async ({ signIn }) => {
    await signIn(uniqueUser());
  });

  test('should navigate to history page via sidebar', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/history"]').click();
    await expect(page).toHaveURL(/\/history/);
  });

  test('should display the history page header', async ({ page }) => {
    await page.goto('/history');
    await expect(page.locator('main')).toContainText('Historique');
    await expect(page.locator('main')).toContainText('Explorez et filtrez');
  });

  test('should display the export button', async ({ page }) => {
    await page.goto('/history');
    const exportButton = page.locator('button', { hasText: 'Exporter' });
    await expect(exportButton.first()).toBeVisible();
  });

  test('should display record count after data loads', async ({ page }) => {
    await page.goto('/history');
    await expect(page.locator('main')).toContainText('6 enregistrements');
  });

  test('should open export modal on button click', async ({ page }) => {
    await page.goto('/history');
    const exportButton = page.locator('button', { hasText: 'Exporter' });
    await exportButton.first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[role="dialog"]')).toContainText('Exporter les données');
  });

  test('should announce csv as the only export format', async ({ page }) => {
    await page.goto('/history');
    await page.locator('button', { hasText: 'Exporter' }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('CSV')).toBeVisible();
    await expect(dialog.getByText('Excel')).toBeHidden();
  });

  test('should display metric checkboxes in export modal', async ({ page }) => {
    await page.goto('/history');
    await page.locator('button', { hasText: 'Exporter' }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.locator('[role="checkbox"]')).toHaveCount(5);
  });

  test('should close export modal with cancel button', async ({ page }) => {
    await page.goto('/history');
    await page.locator('button', { hasText: 'Exporter' }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.locator('[role="dialog"]').locator('button', { hasText: 'Annuler' }).click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should close export modal with close button', async ({ page }) => {
    await page.goto('/history');
    await page.locator('button', { hasText: 'Exporter' }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.locator('[aria-label="Close"]').click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should close export modal with Escape key', async ({ page }) => {
    await page.goto('/history');
    await page.locator('button', { hasText: 'Exporter' }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should toggle metric checkbox', async ({ page }) => {
    await page.goto('/history');
    await page.locator('button', { hasText: 'Exporter' }).first().click();
    const dialog = page.locator('[role="dialog"]');
    const label = dialog.locator('label', { hasText: 'Production (kWh)' });
    const checkbox = label.locator('[role="checkbox"]');

    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await label.click();
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await label.click();
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });
});

test.describe('History page - error state', () => {
  // The only call still intercepted: a failing API cannot be produced otherwise.
  test.beforeEach(async ({ page, signIn }) => {
    await signIn(uniqueUser());
    await page.route('**/api/enphase/all', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: '{"error":"Internal Server Error"}',
      }),
    );
  });

  test('should display error message when API fails', async ({ page }) => {
    await page.goto('/history');
    await expect(page.locator('main')).toContainText('Une erreur est survenue');
  });
});
