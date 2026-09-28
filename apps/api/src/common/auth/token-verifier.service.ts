import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type JWTVerifyGetKey, jwtVerify } from 'jose';
import type { Env } from '../../config/env.js';
import { type AuthUser, toAuthUser } from './auth-user.js';
import { JWKS } from './jwks.provider.js';

@Injectable()
export class TokenVerifier {
  private readonly issuer: string;
  private readonly audience: string;

  constructor(
    @Inject(JWKS) private readonly keys: JWTVerifyGetKey,
    config: ConfigService<Env, true>,
  ) {
    this.issuer = config.get('OIDC_ISSUER_URL', { infer: true }).replace(/\/$/, '');
    this.audience = config.get('OIDC_AUDIENCE', { infer: true });
  }

  /** Checks the signature, issuer, audience and expiry. Throws if the token is not valid. */
  async verify(token: string): Promise<AuthUser> {
    const { payload } = await jwtVerify(token, this.keys, {
      issuer: this.issuer,
      audience: this.audience,
    });
    return toAuthUser(payload);
  }
}
