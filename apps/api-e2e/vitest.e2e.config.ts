import { defineConfig } from 'vitest/config';

// Full-stack e2e: the production build of the API against a real database.
export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/api-e2e',
  test: {
    name: 'api-e2e',
    include: ['src/**/*.e2e.ts'],
    globalSetup: ['src/global-setup.ts'],
    // One worker, retries and long timeouts: the CI runners are shared.
    fileParallelism: false,
    retry: process.env['CI'] ? 2 : 0,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
