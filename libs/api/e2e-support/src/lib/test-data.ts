import { randomUUID } from 'node:crypto';
import type { TestUser } from './fake-issuer.js';

/**
 * A user nobody else uses: the tests never clean the database,
 * each one creates its own data.
 */
export function uniqueUser(overrides: Partial<TestUser> = {}): TestUser {
  const id = randomUUID();
  return {
    subject: `e2e-${id}`,
    email: `e2e-${id}@example.test`,
    name: `E2E ${id.slice(0, 8)}`,
    locale: 'fr',
    ...overrides,
  };
}
