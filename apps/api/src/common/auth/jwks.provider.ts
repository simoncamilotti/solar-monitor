import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, type JWTVerifyGetKey } from 'jose';
import type { Env } from '../../config/env.js';

export const JWKS = Symbol('JWKS');

/**
 * Signing keys of the identity provider, found through OIDC discovery and cached by `jose`.
 * Discovery happens on the first request, so the API starts even if the provider is down.
 */
export const jwksProvider: Provider = {
  provide: JWKS,
  inject: [ConfigService],
  useFactory: (config: ConfigService<Env, true>): JWTVerifyGetKey => {
    const issuer = config.get('OIDC_ISSUER_URL', { infer: true }).replace(/\/$/, '');
    let keys: Promise<JWTVerifyGetKey> | undefined;

    const discover = async (): Promise<JWTVerifyGetKey> => {
      const response = await fetch(`${issuer}/.well-known/openid-configuration`);
      if (!response.ok) {
        throw new Error(`OIDC discovery failed for ${issuer}: HTTP ${response.status}`);
      }
      const { jwks_uri: jwksUri } = (await response.json()) as { jwks_uri: string };
      return createRemoteJWKSet(new URL(jwksUri));
    };

    return async (header, token) => {
      keys ??= discover().catch((error: unknown) => {
        keys = undefined;
        throw error;
      });
      return (await keys)(header, token);
    };
  },
};
