import { defineConfig } from 'orval';

/** Client generated from the OpenAPI document of the API (ADR 0008). */
export default defineConfig({
  api: {
    input: {
      target: '../../../apps/api/openapi.json',
      // Probes are for Kubernetes, not for the clients.
      filters: { mode: 'exclude', tags: ['Health'] },
    },
    output: {
      mode: 'tags-split',
      target: 'src/generated/endpoints',
      schemas: 'src/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      mock: { generators: [{ type: 'msw' }], indexMockFiles: true },
      clean: true,
      prettier: false,
      override: {
        mutator: { path: 'src/mutator.ts', name: 'apiFetch' },
        // Hooks return the response body, errors are thrown as `ApiError`.
        fetch: { includeHttpResponseReturnType: false },
      },
    },
    hooks: {
      afterAllFilesWrite: 'node scripts/index-mocks.mjs',
    },
  },
});
