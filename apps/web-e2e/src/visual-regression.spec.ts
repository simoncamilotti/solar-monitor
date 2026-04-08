import { expect, type Page, test } from '@playwright/test';

import { mockApi } from './api-mock';
import { mockKeycloak } from './keycloak-mock';

const mockHistoryData = [
  { date: '2024-01-15', kwhProduced: 12.5, kwhConsumed: 8.3, kwhImported: 2.1, kwhExported: 6.3, gridDependency: 25.3 },
  {
    date: '2024-02-20',
    kwhProduced: 15.0,
    kwhConsumed: 10.2,
    kwhImported: 1.5,
    kwhExported: 6.3,
    gridDependency: 14.7,
  },
  { date: '2024-03-10', kwhProduced: 18.0, kwhConsumed: 11.0, kwhImported: 1.0, kwhExported: 8.0, gridDependency: 9.1 },
  { date: '2024-04-15', kwhProduced: 20.5, kwhConsumed: 9.5, kwhImported: 0.5, kwhExported: 11.5, gridDependency: 5.3 },
  {
    date: '2024-05-20',
    kwhProduced: 25.0,
    kwhConsumed: 10.0,
    kwhImported: 0.3,
    kwhExported: 15.3,
    gridDependency: 3.0,
  },
  {
    date: '2024-06-10',
    kwhProduced: 22.0,
    kwhConsumed: 12.0,
    kwhImported: 0.8,
    kwhExported: 10.8,
    gridDependency: 6.7,
  },
];

async function mockHistoryApi(page: Page) {
  await page.route('**/api/enphase/all', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockHistoryData),
    }),
  );
}

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
  test.beforeEach(async ({ page, browserName }) => {
    await mockKeycloak(page, browserName);
    await mockApi(page);
    await mockHistoryApi(page);
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
