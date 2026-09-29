import { setUpE2eStack } from '@repo/e2e-support';
import { fileURLToPath } from 'node:url';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    apiUrl: string;
    issuerUrl: string;
    issuerPrivateJwk: string;
  }
}

export default async function setup(project: TestProject) {
  const teardown = await setUpE2eStack(fileURLToPath(new URL('../../..', import.meta.url)));
  project.provide('apiUrl', process.env['E2E_API_URL'] ?? '');
  project.provide('issuerUrl', process.env['E2E_OIDC_ISSUER_URL'] ?? '');
  project.provide('issuerPrivateJwk', process.env['E2E_OIDC_PRIVATE_JWK'] ?? '');
  return teardown;
}
