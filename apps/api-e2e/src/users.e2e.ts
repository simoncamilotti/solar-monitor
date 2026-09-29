import { uniqueUser } from '@repo/e2e-support';
import { describe, expect, it } from 'vitest';
import { apiUrl, authHeader } from './context.js';

describe('GET /api/users/me', () => {
  it('requires a token', async () => {
    const response = await fetch(`${apiUrl}/api/users/me`);

    expect(response.status).toBe(401);
  });

  it('rejects a token that the issuer did not sign', async () => {
    const response = await fetch(`${apiUrl}/api/users/me`, {
      headers: { Authorization: 'Bearer invalid-token' },
    });

    expect(response.status).toBe(401);
    expect(response.headers.get('content-type')).toContain('application/problem+json');
  });

  it('creates the account at the first request', async () => {
    const user = uniqueUser({ locale: 'en' });

    const response = await fetch(`${apiUrl}/api/users/me`, { headers: await authHeader(user) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: expect.any(String),
      email: user.email,
      name: user.name,
      locale: 'en',
    });
  });

  it('returns the same account afterwards', async () => {
    const user = uniqueUser();
    const headers = await authHeader(user);

    const first = (await (await fetch(`${apiUrl}/api/users/me`, { headers })).json()) as {
      id: string;
    };
    const second = (await (await fetch(`${apiUrl}/api/users/me`, { headers })).json()) as {
      id: string;
    };

    expect(second.id).toBe(first.id);
  });
});
