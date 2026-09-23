#!/usr/bin/env node

/**
 * apps/web/public/config.js is gitignored (real deployments mount their own), so it never exists
 * on a fresh checkout — including in CI. Without it, main.tsx throws before Keycloak even
 * initializes, and every E2E test hangs waiting for a UI that never renders. Seed it from the
 * example config, matching what README.md's setup step does for local dev, but never overwrite a
 * config a developer already customized.
 */

import { copyFileSync, existsSync } from 'node:fs';

const SOURCE = 'config/web/config.example.js';
const TARGET = 'apps/web/public/config.js';

if (!existsSync(TARGET)) {
  copyFileSync(SOURCE, TARGET);
  console.log(`${TARGET} was missing, seeded it from ${SOURCE}.`);
}
