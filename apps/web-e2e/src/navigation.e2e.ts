import { uniqueUser } from '@repo/e2e-support';

import { expect, test } from './fixtures.js';

test.describe('Navigation', () => {
  test.beforeEach(async ({ signIn }) => {
    await signIn(uniqueUser());
  });

  test('should navigate to settings page via sidebar link', async ({ page }) => {
    await page.goto('/');
    await page.locator('aside a[href="/settings"]').click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should navigate to compare page via sidebar link', async ({ page }) => {
    await page.goto('/');
    await page.locator('aside a[href="/compare"]').click();
    await expect(page).toHaveURL(/\/compare/);
  });

  test('should navigate back to home from settings', async ({ page }) => {
    await page.goto('/settings');
    await page.locator('aside nav a[href="/"]').click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('should redirect unknown routes to home', async ({ page }) => {
    await page.goto('/unknown-route');
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('Navigation on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ signIn }) => {
    await signIn(uniqueUser());
  });

  test('should swap the sidebar for a bottom navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('aside')).toBeHidden();

    await page
      .getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('link', { name: 'Comparaison' })
      .click();
    await expect(page).toHaveURL(/\/compare/);
  });
});
