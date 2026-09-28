import { defineConfig, devices } from '@playwright/test';

// UI integration tests: the production build of the web, with the API and Keycloak mocked by
// the tests themselves (api-mock.ts, keycloak-mock.ts).
const webUrl = 'http://localhost:4200';
const ci = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './src',
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
          // Disable private network access checks so the mocked Keycloak iframe
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
    command: '../../node_modules/.bin/vite preview --port 4200 --strictPort',
    cwd: '../web',
    url: webUrl,
    reuseExistingServer: !ci,
  },
});
