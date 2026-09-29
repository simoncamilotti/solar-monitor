import { uniqueUser } from '@repo/e2e-support';

import { expect, test } from './fixtures.js';

test.describe('Settings page', () => {
  test.beforeEach(async ({ signIn }) => {
    await signIn(uniqueUser());
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
