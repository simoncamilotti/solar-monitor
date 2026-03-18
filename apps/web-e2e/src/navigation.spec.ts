import { expect, test } from '@playwright/test';

import { mockApi } from './api-mock';
import { mockKeycloak } from './keycloak-mock';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page, browserName }) => {
    await mockKeycloak(page, browserName);
    await mockApi(page);
  });

  test('should navigate to settings page via sidebar link', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/settings"]').click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should navigate back to home from settings', async ({ page }) => {
    await page.goto('/settings');
    await page.locator('nav a[href="/"]').click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('should redirect unknown routes to home', async ({ page }) => {
    await page.goto('/unknown-route');
    await expect(page).toHaveURL(/\/$/);
  });
});
