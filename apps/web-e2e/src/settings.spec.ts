import { expect, test } from '@playwright/test';

import { mockApi } from './api-mock';
import { mockKeycloak } from './keycloak-mock';

test.describe('Settings page', () => {
  test.beforeEach(async ({ page, browserName }) => {
    await mockKeycloak(page, browserName);
    await mockApi(page);
  });

  test('should display feature flags list', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('dark-mode')).toBeVisible();
    await expect(page.getByText('blog')).toBeVisible();
  });

  test('should display feature flag toggle switches', async ({ page }) => {
    await page.goto('/settings');
    const switches = page.locator('button[role="switch"]');
    await expect(switches).toHaveCount(2);
  });

  test('should toggle a feature flag', async ({ page }) => {
    await page.goto('/settings');
    const firstSwitch = page.locator('button[role="switch"]').first();
    await expect(firstSwitch).toHaveAttribute('aria-checked', 'true');
    await firstSwitch.click();
    await expect(firstSwitch).toHaveAttribute('aria-checked', 'false');
  });

  test('should display the feature flag creation form', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('form input')).toBeVisible();
  });

  test('should create a new feature flag', async ({ page }) => {
    await page.goto('/settings');
    const input = page.locator('form input');
    await input.fill('new-flag');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText('new-flag')).toBeVisible();
  });
});
