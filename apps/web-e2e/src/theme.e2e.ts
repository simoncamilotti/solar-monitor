import { expect, test } from '@playwright/test';

import { mockApi } from './api-mock.js';
import { mockOidc } from './oidc-mock.js';

test.describe('Theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await mockOidc(page);
    await mockApi(page);
  });

  test('should default to dark theme', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });

  test('should toggle to light theme', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Click the theme toggle button (contains light/dark mode text)
    const themeButton = page.locator('aside button').filter({ hasText: /mode/i });
    await themeButton.click();

    await expect(html).not.toHaveClass(/dark/);
  });

  test('should persist theme in localStorage', async ({ page }) => {
    await page.goto('/');

    const themeButton = page.locator('aside button').filter({ hasText: /mode/i });
    await themeButton.click();

    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('light');
  });
});
