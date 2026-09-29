import { defineConfig, devices } from '@playwright/test';
import { E2E_CLIENT_ID, readE2eEnv } from '@repo/e2e-support';

// Full-stack e2e: the production build of the web against the production build
// of the API, a real database and a fake OIDC issuer.
const env = readE2eEnv();
const webUrl = `http://localhost:${env.E2E_WEB_PORT}`;
const ci = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  globalSetup: './src/global-setup.ts',
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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // The binary itself, not through pnpm: Playwright must be able to stop it.
    command: `./node_modules/.bin/vite preview --port ${env.E2E_WEB_PORT} --strictPort`,
    cwd: '../web',
    url: webUrl,
    reuseExistingServer: !ci,
    env: {
      WEB_API_URL: `http://localhost:${env.E2E_API_PORT}`,
      WEB_OIDC_AUTHORITY: `http://localhost:${env.E2E_ISSUER_PORT}`,
      WEB_OIDC_CLIENT_ID: E2E_CLIENT_ID,
    },
  },
});
