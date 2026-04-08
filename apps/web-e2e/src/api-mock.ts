import type { Page } from '@playwright/test';

const syncStatus = [
  { systemId: 1, lastSyncDate: '2024-06-10T12:00:00Z', totalRecords: 180 },
  { systemId: 2, lastSyncDate: null, totalRecords: 0 },
];

const syncSchedule = { syncTime: '02:00' };

/**
 * Intercepts all API requests and returns mock data.
 * Must be called before any page navigation.
 */
export async function mockApi(page: Page): Promise<void> {
  await page.route('**/api/enphase/sync-status', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(syncStatus),
    }),
  );

  await page.route('**/api/enphase/sync-schedule', route => {
    const method = route.request().method();

    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(syncSchedule),
      });
    }

    if (method === 'PUT') {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ syncTime: body.syncTime }),
      });
    }

    return route.continue();
  });

  await page.route('**/api/enphase/sync?*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Sync triggered' }),
    }),
  );

  await page.route('**/api/enphase/backfill?*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Backfill completed', daysBackfilled: 365 }),
    }),
  );
}
