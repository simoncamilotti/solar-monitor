import { expect, test } from '@playwright/test';

import { mockApi } from './api-mock.js';
import { mockOidc } from './oidc-mock.js';

test.describe('Settings page', () => {
  test.beforeEach(async ({ page }) => {
    await mockOidc(page);
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
