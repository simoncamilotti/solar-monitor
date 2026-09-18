/// <reference types='vitest' />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/api-e2e',
  plugins: [nxViteTsPaths()],
  test: {
    name: 'api-e2e',
    watch: false,
    globals: true,
    environment: 'node',
    globalSetup: ['./src/support/global-setup.ts'],
    setupFiles: ['./src/support/test-setup.ts'],
    include: ['src/**/*.{test,spec}.ts'],
    reporters: ['default'],
    // The suite talks to a real API, a real database and a real Keycloak: parallel files would
    // race on the same rows.
    fileParallelism: false,
    coverage: {
      reportsDirectory: '../../coverage/apps/api-e2e',
      provider: 'v8' as const,
    },
  },
}));
