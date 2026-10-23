import type { Page } from '@playwright/test';
import { uniqueUser } from '@repo/e2e-support';

import { expect, test } from './fixtures.js';

type VisualPage = {
  name: string;
  path: string;
  waitFor: string;
  /** Stored in `localStorage` before the page loads, to open it on a given state. */
  storage?: Record<string, unknown>;
};

const pages: VisualPage[] = [
  { name: 'dashboard', path: '/', waitFor: 'main' },
  { name: 'compare', path: '/compare', waitFor: 'main' },
  {
    name: 'compare-ranges',
    path: '/compare',
    waitFor: 'section[aria-labelledby="compare-summary-title"]',
    storage: {
      'comparison-filters': {
        granularity: 'ranges',
        resolution: 'weekly',
        metric: 'kwhProduced',
        chartType: 'bar',
        periods: [
          { start: '2024-04-01', end: '2024-06-15', name: 'Printemps' },
          { start: '2024-01-01', end: '2024-03-15' },
        ],
      },
    },
  },
  { name: 'history', path: '/history', waitFor: 'main' },
  {
    name: 'history-calendar',
    path: '/history?view=calendar',
    waitFor: 'section[aria-labelledby="calendar-title"] .echarts-for-react svg',
  },
  { name: 'settings', path: '/settings', waitFor: 'input[type="time"]' },
];

async function waitForPageReady(page: Page, waitSelector: string) {
  await page.locator(waitSelector).waitFor({ state: 'visible' });
  await page.waitForLoadState('domcontentloaded');
  // Extra stabilization for ECharts canvas animations
  await page.waitForTimeout(500);
}

async function seedStorage(page: Page, storage: VisualPage['storage']) {
  if (storage) {
    await page.addInitScript((entries) => {
      for (const [key, value] of Object.entries(entries)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }, storage);
  }
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

  for (const { name, path, waitFor, storage } of pages) {
    test(`${name} - dark theme`, async ({ page }) => {
      await page.clock.setFixedTime(new Date('2024-07-01T12:00:00Z'));
      await seedStorage(page, storage);
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
      await seedStorage(page, storage);
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
