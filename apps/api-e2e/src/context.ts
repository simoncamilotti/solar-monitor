import { issuerFromEnv, signAccessToken, type TestUser } from '@repo/e2e-support';
import { inject } from 'vitest';

export const apiUrl = inject('apiUrl');

const issuer = issuerFromEnv({
  E2E_OIDC_ISSUER_URL: inject('issuerUrl'),
  E2E_OIDC_PRIVATE_JWK: inject('issuerPrivateJwk'),
});

/** Authorization header of a signed-in user. */
export async function authHeader(user: TestUser): Promise<Record<string, string>> {
  return { Authorization: `Bearer ${await signAccessToken(issuer, user)}` };
}
