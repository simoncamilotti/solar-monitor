import { expect, test } from '@playwright/test';

import { mockApi } from './api-mock';
import { mockKeycloak } from './keycloak-mock';

test.describe('Settings page', () => {
  test.beforeEach(async ({ page, browserName }) => {
    await mockKeycloak(page, browserName);
    await mockApi(page);
  });

  test('should display sync status section', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('#1')).toBeVisible();
    await expect(page.getByText('#2')).toBeVisible();
  });

  test('should display sync schedule section', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('input[type="time"]')).toBeVisible();
  });
});
