import type { Page } from '@playwright/test';

/** Identity provider of the tests: the web reads it from `/config.js` (`playwright.config.ts`). */
export const OIDC_AUTHORITY = 'http://localhost:8080/realms/test';
export const OIDC_CLIENT_ID = 'solar-monitor-web';

function base64url(input: string): string {
  return Buffer.from(input).toString('base64url');
}

/** Unsigned token: `oidc-client-ts` decodes the ID token, the signature is the API's business. */
function mockJwt(payload: Record<string, unknown>): string {
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  return `${header}.${base64url(JSON.stringify(payload))}.mock-signature`;
}

const cors = { 'Access-Control-Allow-Origin': '*' };

/**
 * Answers the OIDC flow of `oidc-client-ts`: discovery, authorization redirect straight back
 * with a code, and code exchange. Must be called before any page navigation.
 */
export async function mockOidc(page: Page): Promise<void> {
  await page.route(`${OIDC_AUTHORITY}/**`, (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith('/.well-known/openid-configuration')) {
      const endpoint = `${OIDC_AUTHORITY}/protocol/openid-connect`;
      return route.fulfill({
        headers: cors,
        contentType: 'application/json',
        body: JSON.stringify({
          issuer: OIDC_AUTHORITY,
          authorization_endpoint: `${endpoint}/auth`,
          token_endpoint: `${endpoint}/token`,
          end_session_endpoint: `${endpoint}/logout`,
          jwks_uri: `${endpoint}/certs`,
          response_types_supported: ['code'],
          code_challenge_methods_supported: ['S256'],
        }),
      });
    }

    // The user is already signed in at the provider: straight back with a code.
    if (url.pathname.endsWith('/protocol/openid-connect/auth')) {
      const callback = new URL(url.searchParams.get('redirect_uri') ?? '');
      callback.searchParams.set('code', 'mock-code');
      callback.searchParams.set('state', url.searchParams.get('state') ?? '');
      return route.fulfill({ status: 302, headers: { Location: callback.toString() } });
    }

    if (url.pathname.endsWith('/protocol/openid-connect/token')) {
      const now = Math.floor(Date.now() / 1000);
      const claims = { iss: OIDC_AUTHORITY, aud: OIDC_CLIENT_ID, sub: 'mock-user', iat: now };
      return route.fulfill({
        headers: cors,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: mockJwt({ ...claims, exp: now + 3600 }),
          id_token: mockJwt({ ...claims, exp: now + 3600 }),
          token_type: 'Bearer',
          expires_in: 3600,
          scope: 'openid profile email',
        }),
      });
    }

    return route.fulfill({ status: 404, headers: cors });
  });
}
