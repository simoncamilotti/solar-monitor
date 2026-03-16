import type { Page } from '@playwright/test';

/**
 * Intercepts all API requests and returns mock data.
 * Must be called before any page navigation.
 */
export async function mockApi(page: Page): Promise<void> {
  await page.route('**/api/feature-flags', route => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    }

    return route.continue();
  });
}
