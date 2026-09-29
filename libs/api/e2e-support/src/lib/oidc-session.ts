import type { TestUser } from './fake-issuer.js';

/**
 * Entry that `oidc-client-ts` reads from the session storage: injecting it signs the user in
 * without going through the identity provider's login page.
 */
export function oidcSessionEntry(options: {
  authority: string;
  clientId: string;
  accessToken: string;
  user: TestUser;
}): { key: string; value: string } {
  return {
    key: `oidc.user:${options.authority}:${options.clientId}`,
    value: JSON.stringify({
      access_token: options.accessToken,
      token_type: 'Bearer',
      scope: 'openid profile email',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      profile: {
        sub: options.user.subject,
        email: options.user.email,
        name: options.user.name,
        iss: options.authority,
        aud: options.clientId,
      },
    }),
  };
}
