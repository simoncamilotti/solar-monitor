// Runs after orval: exports every generated MSW file, so tests can override a single endpoint.
import { readdirSync, writeFileSync } from 'node:fs';

const endpoints = new URL('../src/generated/endpoints/', import.meta.url);
const exports = readdirSync(endpoints, { recursive: true })
  .filter((file) => file.endsWith('.msw.ts') && file.includes('/'))
  .sort()
  .map((file) => `export * from './endpoints/${file.replace(/\.ts$/, '.js')}';`);
writeFileSync(new URL('../src/generated/mocks.ts', import.meta.url), `${exports.join('\n')}\n`);
