import { E2E_CLIENT_ID } from '@repo/e2e-support';

import { expect, test } from './fixtures.js';

test('sends a signed-out visitor to the identity provider', async ({ page }) => {
  await page.goto('/history');

  await page.waitForURL(/\/authorize\?/);
  expect(new URL(page.url()).searchParams.get('client_id')).toBe(E2E_CLIENT_ID);
});
