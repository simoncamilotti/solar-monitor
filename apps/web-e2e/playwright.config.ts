import { defineConfig, devices } from '@playwright/test';

import { OIDC_AUTHORITY, OIDC_CLIENT_ID } from './src/oidc-mock.js';

// UI integration tests: the production build of the web, with the API and the identity provider
// mocked by the tests themselves (api-mock.ts, oidc-mock.ts).
const webUrl = 'http://localhost:4200';
const ci = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  // One worker, retries and long timeouts: the CI runners are shared.
  workers: 1,
  retries: ci ? 2 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: ci ? [['list'], ['html', { open: 'never' }]] : 'list',
  outputDir: './test-output/results',
  use: {
    baseURL: webUrl,
    locale: 'fr-FR',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          // Disable private network access checks so the mocked identity provider
          // redirect (localhost:8080 → localhost:4200) is not blocked by Chrome.
          args: [
            '--disable-features=PrivateNetworkAccessForIframes,BlockInsecurePrivateNetworkRequests',
          ],
        },
      },
    },
  ],
  webServer: {
    // The binary itself, not through pnpm: Playwright must be able to stop it.
    command: './node_modules/.bin/vite preview --port 4200 --strictPort',
    cwd: '../web',
    url: webUrl,
    reuseExistingServer: !ci,
    // Served as /config.js by the runtime-config plugin of the web.
    env: {
      WEB_API_URL: webUrl,
      WEB_OIDC_AUTHORITY: OIDC_AUTHORITY,
      WEB_OIDC_CLIENT_ID: OIDC_CLIENT_ID,
    },
  },
});
