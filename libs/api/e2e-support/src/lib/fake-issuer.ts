import { createServer, type Server } from 'node:http';
import { exportJWK, generateKeyPair, importJWK, type JWK, SignJWT } from 'jose';

export const E2E_CLIENT_ID = 'web';
export const E2E_AUDIENCE = 'api';
const KEY_ID = 'e2e';

export interface FakeIssuer {
  url: string;
  /** Private key, shared with the test workers through `E2E_OIDC_PRIVATE_JWK`. */
  privateJwk: JWK;
  close: () => Promise<void>;
}

/**
 * Minimal OIDC issuer: discovery and JWKS for the API, no Keycloak.
 * The tests sign their own tokens with `signAccessToken`.
 */
export async function startFakeIssuer(port: number): Promise<FakeIssuer> {
  const url = `http://localhost:${port}`;
  const { publicKey, privateKey } = await generateKeyPair('RS256', { extractable: true });
  const publicJwk = { ...(await exportJWK(publicKey)), kid: KEY_ID, alg: 'RS256', use: 'sig' };

  const documents: Record<string, unknown> = {
    '/.well-known/openid-configuration': {
      issuer: url,
      jwks_uri: `${url}/jwks`,
      authorization_endpoint: `${url}/authorize`,
      token_endpoint: `${url}/token`,
      end_session_endpoint: `${url}/logout`,
    },
    '/jwks': { keys: [publicJwk] },
  };

  const server: Server = createServer((request, response) => {
    const document = documents[request.url?.split('?')[0] ?? ''];
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Content-Type', document ? 'application/json' : 'text/plain');
    response.statusCode = document ? 200 : 404;
    response.end(document ? JSON.stringify(document) : 'Not found');
  });
  await new Promise<void>((resolve) => server.listen(port, resolve));

  return {
    url,
    privateJwk: { ...(await exportJWK(privateKey)), kid: KEY_ID, alg: 'RS256' },
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

export interface TestUser {
  subject: string;
  email: string;
  name: string;
  locale?: string;
  roles?: string[];
}

/** Access token as the identity provider would issue it for this user. */
export async function signAccessToken(
  issuer: { url: string; privateJwk: JWK },
  user: TestUser,
): Promise<string> {
  const key = await importJWK(issuer.privateJwk, 'RS256');
  return new SignJWT({
    email: user.email,
    name: user.name,
    locale: user.locale,
    roles: user.roles ?? ['user'],
    azp: E2E_CLIENT_ID,
  })
    .setProtectedHeader({ alg: 'RS256', kid: KEY_ID })
    .setIssuer(issuer.url)
    .setAudience(E2E_AUDIENCE)
    .setSubject(user.subject)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);
}

/** Reads the issuer shared by the global setup. */
export function issuerFromEnv(env: NodeJS.ProcessEnv = process.env): {
  url: string;
  privateJwk: JWK;
} {
  const url = env['E2E_OIDC_ISSUER_URL'];
  const jwk = env['E2E_OIDC_PRIVATE_JWK'];
  if (!url || !jwk) {
    throw new Error('The fake OIDC issuer is not running: E2E_OIDC_ISSUER_URL is not set.');
  }
  return { url, privateJwk: JSON.parse(jwk) as JWK };
}
