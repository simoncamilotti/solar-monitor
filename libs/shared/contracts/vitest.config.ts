import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/shared/contracts',
  test: {
    name: '@repo/contracts',
    globals: true,
    environment: 'node',
    include: ['src/**/*.{spec,test}.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './test-output/coverage',
    },
  },
});
