import { readFileSync } from 'node:fs';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const swcrc = JSON.parse(readFileSync(new URL('.swcrc', import.meta.url), 'utf8'));

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/api',
  // SWC emits the decorator metadata Nest relies on for dependency injection (ADR 0006).
  // Same compiler options as the build.
  plugins: [swc.vite(swcrc)],
  test: {
    name: 'api',
    globals: true,
    environment: 'node',
    include: ['src/**/*.{spec,test}.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './test-output/coverage',
    },
  },
});
