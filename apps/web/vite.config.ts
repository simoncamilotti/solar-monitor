import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defaultClientConditions } from 'vite';
import { defineConfig } from 'vitest/config';
import { runtimeConfig } from './runtime-config.plugin.js';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  resolve: {
    // Workspace libs are read from their sources.
    conditions: ['@repo/source', ...defaultClientConditions],
  },
  server: { port: 4200, strictPort: true, host: 'localhost' },
  preview: { port: 4200, host: 'localhost' },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/route-tree.gen.ts',
    }),
    react(),
    runtimeConfig(),
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        // echarts and ag-grid are each only needed by one route (Home/Compare and History,
        // respectively): splitting them out keeps them from padding every other page's chunk.
        codeSplitting: {
          groups: [
            { name: 'echarts', test: /node_modules[\\/](echarts|echarts-for-react|zrender)[\\/]/ },
            { name: 'ag-grid', test: /node_modules[\\/](ag-grid-community|ag-grid-react)[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    name: 'web',
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './test-output/coverage',
    },
  },
});
