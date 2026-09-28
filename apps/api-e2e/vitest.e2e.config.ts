import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/api-e2e',
  test: {
    name: 'api-e2e',
    globals: true,
    environment: 'node',
    globalSetup: ['./src/support/global-setup.ts'],
    setupFiles: ['./src/support/test-setup.ts'],
    include: ['src/**/*.{test,spec}.ts'],
    // The suite talks to a real API, a real database and a real Keycloak: parallel files would
    // race on the same rows.
    fileParallelism: false,
  },
});
