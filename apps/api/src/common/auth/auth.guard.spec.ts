import { type ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import type { Env } from '../../config/env.js';
import { AuthGuard } from './auth.guard.js';
import { Public } from './public.decorator.js';
import { Roles } from './roles.decorator.js';
import { TokenVerifier } from './token-verifier.service.js';

const ISSUER = 'http://issuer.test/realms/app';
const AUDIENCE = 'api';

class TestController {
  @Public()
  open() {
    return 'open';
  }

  protectedRoute() {
    return 'protected';
  }

  @Roles('admin')
  adminOnly() {
    return 'admin';
  }
}

function contextFor(handler: () => string, authorization?: string) {
  const request: { headers: { authorization?: string }; user?: unknown } = {
    headers: authorization ? { authorization } : {},
  };
  const context = {
    getHandler: () => handler,
    getClass: () => TestController,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let sign: (claims: Record<string, unknown>, audience?: string) => Promise<string>;

  beforeAll(async () => {
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    const jwk = { ...(await exportJWK(publicKey)), kid: 'test', alg: 'RS256' };
    const config = {
      get: (key: keyof Env) =>
        ({ OIDC_ISSUER_URL: ISSUER, OIDC_AUDIENCE: AUDIENCE })[key as string],
    } as unknown as ConfigService<Env, true>;
    const verifier = new TokenVerifier(createLocalJWKSet({ keys: [jwk] }), config);
    guard = new AuthGuard(new Reflector(), verifier);
    sign = (claims, audience = AUDIENCE) =>
      new SignJWT(claims)
        .setProtectedHeader({ alg: 'RS256', kid: 'test' })
        .setIssuer(ISSUER)
        .setAudience(audience)
        .setSubject('user-1')
        .setExpirationTime('5m')
        .sign(privateKey);
  });

  const controller = new TestController();

  it('lets public routes through without a token', async () => {
    await expect(guard.canActivate(contextFor(controller.open).context)).resolves.toBe(true);
  });

  it('rejects a request without a token', async () => {
    await expect(guard.canActivate(contextFor(controller.protectedRoute).context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('accepts a valid token and exposes the caller', async () => {
    const token = await sign({ email: 'ada@example.com', name: 'Ada', roles: ['user'] });
    const { context, request } = contextFor(controller.protectedRoute, `Bearer ${token}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      subject: 'user-1',
      email: 'ada@example.com',
      name: 'Ada',
      locale: undefined,
      roles: ['user'],
    });
  });

  it('rejects a token issued for another audience', async () => {
    const token = await sign({}, 'another-api');
    await expect(
      guard.canActivate(contextFor(controller.protectedRoute, `Bearer ${token}`).context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('checks the required roles', async () => {
    const user = await sign({ roles: ['user'] });
    const admin = await sign({ roles: ['admin'] });

    await expect(
      guard.canActivate(contextFor(controller.adminOnly, `Bearer ${user}`).context),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      guard.canActivate(contextFor(controller.adminOnly, `Bearer ${admin}`).context),
    ).resolves.toBe(true);
  });
});
