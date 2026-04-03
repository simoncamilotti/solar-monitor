import type { Page } from '@playwright/test';

const featureFlags = [
  { key: 'dark-mode', enabled: true },
  { key: 'blog', enabled: false },
];

const syncStatus = [
  { systemId: 1, lastSyncDate: '2024-06-10T12:00:00Z', totalRecords: 180 },
  { systemId: 2, lastSyncDate: null, totalRecords: 0 },
];

/**
 * Intercepts all API requests and returns mock data.
 * Must be called before any page navigation.
 */
export async function mockApi(page: Page): Promise<void> {
  await page.route('**/api/feature-flags', route => {
    const method = route.request().method();

    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(featureFlags),
      });
    }

    if (method === 'POST') {
      const body = route.request().postDataJSON();
      const created = { key: body.key, enabled: body.enabled ?? false };
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
    }

    return route.continue();
  });

  await page.route('**/api/enphase/sync-status', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(syncStatus),
    }),
  );

  await page.route('**/api/enphase/sync?*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Sync triggered' }),
    }),
  );

  await page.route('**/api/feature-flags/*', route => {
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON();
      const url = route.request().url();
      const key = url.split('/').pop();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ key, enabled: body.enabled }),
      });
    }

    return route.continue();
  });
}
