import type { Page } from '@playwright/test';
import { uniqueUser } from '@repo/e2e-support';

import { expect, test } from './fixtures.js';

const pages = [
  { name: 'dashboard', path: '/', waitFor: 'main' },
  { name: 'compare', path: '/compare', waitFor: 'main' },
  { name: 'history', path: '/history', waitFor: 'main' },
  { name: 'settings', path: '/settings', waitFor: 'input[type="time"]' },
] as const;

async function waitForPageReady(page: Page, waitSelector: string) {
  await page.locator(waitSelector).waitFor({ state: 'visible' });
  await page.waitForLoadState('domcontentloaded');
  // Extra stabilization for ECharts canvas animations
  await page.waitForTimeout(500);
}

async function switchToLightTheme(page: Page) {
  const themeButton = page.locator('aside button').filter({ hasText: /mode/i });
  await themeButton.click();
  await page.locator('html:not(.dark)').waitFor();
}

test.describe('Visual regression', () => {
  // The charts skip their animations: a screenshot never catches the bars mid-growth.
  test.use({ reducedMotion: 'reduce' });

  test.beforeEach(async ({ signIn }) => {
    await signIn(uniqueUser());
  });

  for (const { name, path, waitFor } of pages) {
    test(`${name} - dark theme`, async ({ page }) => {
      await page.clock.setFixedTime(new Date('2024-07-01T12:00:00Z'));
      await page.goto(path);
      await waitForPageReady(page, waitFor);
      await expect(page).toHaveScreenshot(`${name}-dark.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
      });
    });

    test(`${name} - light theme`, async ({ page }) => {
      await page.clock.setFixedTime(new Date('2024-07-01T12:00:00Z'));
      await page.goto(path);
      await waitForPageReady(page, waitFor);
      await switchToLightTheme(page);
      await expect(page).toHaveScreenshot(`${name}-light.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
      });
    });
  }
});
