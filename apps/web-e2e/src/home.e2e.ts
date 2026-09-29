import { uniqueUser } from '@repo/e2e-support';

import { expect, test } from './fixtures.js';

test.describe('Home page', () => {
  test.beforeEach(async ({ signIn }) => {
    await signIn(uniqueUser());
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
