import { setUpE2eStack } from '@repo/e2e-support';
import { fileURLToPath } from 'node:url';

// The environment variables set here reach the test workers.
export default async function globalSetup() {
  return setUpE2eStack(fileURLToPath(new URL('../../..', import.meta.url)));
}
