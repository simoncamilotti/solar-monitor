import { expect, test } from '@playwright/test';

import { mockApi } from './api-mock';
import { mockKeycloak } from './keycloak-mock';

test.describe('Home page', () => {
  test.beforeEach(async ({ page, browserName }) => {
    await mockKeycloak(page, browserName);
    await mockApi(page);
  });

  test('should display the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main')).toContainText('Tableau de bord');
  });

  test('should display the sidebar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('aside')).toBeVisible();
  });

  test('should display navigation links', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('a[href="/"]')).toBeVisible();
  });
});
