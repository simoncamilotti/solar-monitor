import type { Page } from '@playwright/test';

const KEYCLOAK_URL = 'http://localhost:8080';
const REALM = 'template';
const CLIENT_ID = 'template-web';
const ISSUER = `${KEYCLOAK_URL}/realms/${REALM}`;

function base64url(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function mockJwt(payload: Record<string, unknown>): string {
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  return `${header}.${body}.mock-signature`;
}

/**
 * Intercepts all Keycloak requests and simulates the OIDC check-sso flow.
 * Must be called before any page navigation.
 */
export async function mockKeycloak(page: Page, browserName = 'chromium'): Promise<void> {
  const sessionState = 'mock-session-id';
  let capturedNonce: string | null = null;

  await page.route(`${KEYCLOAK_URL}/**`, route => {
    const url = route.request().url();

    // 3rd-party cookies check (keycloak-js runs this before anything else)
    if (url.includes('3p-cookies/step1.html')) {
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><script>parent.postMessage("supported", "*")</script></body></html>',
      });
    }
    if (url.includes('3p-cookies/step2.html')) {
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><script>parent.postMessage("supported", "*")</script></body></html>',
      });
    }

    // Login status iframe (used for session monitoring)
    if (url.includes('login-status-iframe.html')) {
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<html><body><script>
          window.addEventListener("message", function(e) {
            e.source.postMessage("changed", e.origin);
          });
        </script></body></html>`,
      });
    }

    // OIDC discovery
    if (url.includes('.well-known/openid-configuration')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          issuer: ISSUER,
          authorization_endpoint: `${ISSUER}/protocol/openid-connect/auth`,
          token_endpoint: `${ISSUER}/protocol/openid-connect/token`,
          jwks_uri: `${ISSUER}/protocol/openid-connect/certs`,
          end_session_endpoint: `${ISSUER}/protocol/openid-connect/logout`,
          grant_types_supported: ['authorization_code', 'refresh_token'],
          response_types_supported: ['code'],
          response_modes_supported: ['fragment', 'query'],
          subject_types_supported: ['public'],
          id_token_signing_alg_values_supported: ['RS256'],
          code_challenge_methods_supported: ['S256'],
        }),
      });
    }

    // JWKS endpoint
    if (url.includes('/protocol/openid-connect/certs')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ keys: [] }),
      });
    }

    // Authorization endpoint (called via iframe for check-sso)
    if (url.includes('/protocol/openid-connect/auth')) {
      const parsed = new URL(url);
      const state = parsed.searchParams.get('state') ?? '';
      const redirectUri = parsed.searchParams.get('redirect_uri') ?? '';
      capturedNonce = parsed.searchParams.get('nonce');

      const fragment = new URLSearchParams({
        state,
        session_state: sessionState,
        iss: ISSUER,
        code: 'mock-auth-code',
      }).toString();

      const targetUrl = `${redirectUri}#${fragment}`;

      // Redirect the iframe to silent-check-sso.html with the auth code in the fragment.
      // WebKit doesn't support route.fulfill() with redirect status codes,
      // so we use a JS redirect for WebKit and HTTP 302 for others.
      if (browserName === 'webkit') {
        return route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: `<html><body><script>window.location.replace("${targetUrl}")</script></body></html>`,
        });
      }
      return route.fulfill({
        status: 302,
        headers: { Location: targetUrl },
      });
    }

    // Token endpoint (code exchange)
    if (url.includes('/protocol/openid-connect/token')) {
      const now = Math.floor(Date.now() / 1000);

      const accessToken = mockJwt({
        exp: now + 300,
        iat: now,
        iss: ISSUER,
        aud: CLIENT_ID,
        sub: 'mock-user-id',
        azp: CLIENT_ID,
        typ: 'Bearer',
        session_state: sessionState,
        scope: 'openid profile email',
        preferred_username: 'testuser',
      });

      const idToken = mockJwt({
        exp: now + 300,
        iat: now,
        iss: ISSUER,
        aud: CLIENT_ID,
        sub: 'mock-user-id',
        azp: CLIENT_ID,
        typ: 'ID',
        session_state: sessionState,
        nonce: capturedNonce,
      });

      const refreshToken = mockJwt({
        exp: now + 1800,
        iat: now,
        iss: ISSUER,
        aud: CLIENT_ID,
        sub: 'mock-user-id',
        azp: CLIENT_ID,
        typ: 'Refresh',
        session_state: sessionState,
        scope: 'openid profile email',
      });

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: accessToken,
          id_token: idToken,
          token_type: 'Bearer',
          expires_in: 300,
          refresh_token: refreshToken,
          refresh_expires_in: 1800,
          session_state: sessionState,
          scope: 'openid profile email',
        }),
      });
    }

    // Logout endpoint
    if (url.includes('/protocol/openid-connect/logout')) {
      return route.fulfill({ status: 204 });
    }

    // Default: realm config
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        realm: REALM,
        public_key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA',
        'token-service': `${ISSUER}/protocol/openid-connect`,
      }),
    });
  });
}
