import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../services/auth.service';
import { AuthUser } from '../types/auth-user.type';
import { JWTPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly _authService: AuthService,
  ) {
    const issuerUrl = configService.getOrThrow<string>('KEYCLOAK_ISSUER_URL');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuerUrl}/protocol/openid-connect/certs`,
      }),
      issuer: issuerUrl,
      audience: configService.getOrThrow<string>('KEYCLOAK_CLIENT_ID'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JWTPayload): Promise<AuthUser> {
    const dbUser = await this._authService.getOrCreateUser(payload);

    return {
      id: dbUser.id,
      keycloakId: payload.sub,
      email: payload.email,
      username: payload.preferred_username,
      firstName: payload.given_name,
      lastName: payload.family_name,
      roles: payload.realm_access?.roles || [],
    };
  }
}
