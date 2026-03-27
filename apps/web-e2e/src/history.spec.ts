import { expect, type Page, test } from '@playwright/test';

import { mockApi } from './api-mock';
import { mockKeycloak } from './keycloak-mock';

const mockHistoryData = [
  { date: '2024-01-15', kwhProduced: 12.5, kwhConsumed: 8.3, kwhImported: 2.1, kwhExported: 6.3, gridDependency: 25.3 },
  {
    date: '2024-02-20',
    kwhProduced: 15.0,
    kwhConsumed: 10.2,
    kwhImported: 1.5,
    kwhExported: 6.3,
    gridDependency: 14.7,
  },
  {
    date: '2024-06-10',
    kwhProduced: 22.0,
    kwhConsumed: 12.0,
    kwhImported: 0.8,
    kwhExported: 10.8,
    gridDependency: 6.7,
  },
];

async function mockHistoryApi(page: Page) {
  await page.route('**/api/enphase/all', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockHistoryData),
    }),
  );
}

test.describe('History page', () => {
  test.beforeEach(async ({ page, browserName }) => {
    await mockKeycloak(page, browserName);
    await mockApi(page);
    await mockHistoryApi(page);
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
    await expect(page.locator('main')).toContainText('3 enregistrements');
  });

  test('should open export modal on button click', async ({ page }) => {
    await page.goto('/history');
    const exportButton = page.locator('button', { hasText: 'Exporter' });
    await exportButton.first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[role="dialog"]')).toContainText('Exporter les données');
  });

  test('should display format options in export modal', async ({ page }) => {
    await page.goto('/history');
    await page.locator('button', { hasText: 'Exporter' }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.locator('button', { hasText: 'CSV' })).toBeVisible();
    await expect(dialog.locator('button', { hasText: 'Excel' })).toBeVisible();
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
    const label = dialog.locator('label', { hasText: 'Production (Wh)' });
    const checkbox = label.locator('[role="checkbox"]');

    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await label.click();
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await label.click();
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });
});

test.describe('History page - error state', () => {
  test.beforeEach(async ({ page, browserName }) => {
    await mockKeycloak(page, browserName);
    await mockApi(page);
    await page.route('**/api/enphase/all', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Internal Server Error"}' }),
    );
  });

  test('should display error message when API fails', async ({ page }) => {
    await page.goto('/history');
    await expect(page.locator('main')).toContainText('Une erreur est survenue');
  });
});
