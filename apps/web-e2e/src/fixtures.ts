import { test as base, type Page } from '@playwright/test';
import {
  E2E_CLIENT_ID,
  issuerFromEnv,
  oidcSessionEntry,
  signAccessToken,
  type TestUser,
} from '@repo/e2e-support';

/** Signs the user in by injecting the session that `oidc-client-ts` reads at startup. */
async function signIn(page: Page, user: TestUser): Promise<void> {
  const issuer = issuerFromEnv();
  const entry = oidcSessionEntry({
    authority: issuer.url,
    clientId: E2E_CLIENT_ID,
    accessToken: await signAccessToken(issuer, user),
    user,
  });
  await page.addInitScript(({ key, value }) => window.sessionStorage.setItem(key, value), entry);
}

export const test = base.extend<{ signIn: (user: TestUser) => Promise<void> }>({
  signIn: async ({ page }, use) => {
    await use((user) => signIn(page, user));
  },
});

export { expect } from '@playwright/test';
