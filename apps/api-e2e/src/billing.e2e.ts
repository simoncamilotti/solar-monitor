import { uniqueUser } from '@repo/e2e-support';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { apiUrl, authHeader } from './context.js';

// The billing start belongs to the household: the test puts it back to "unknown" afterwards, so
// that no other suite sees it.
describe('/api/pricing/billing', () => {
  let headers: Record<string, string>;

  const put = (body: unknown) =>
    fetch(`${apiUrl}/api/pricing/billing`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  beforeAll(async () => {
    headers = await authHeader(uniqueUser());
  });

  afterAll(async () => {
    await put({ startDate: null });
  });

  it('requires a token', async () => {
    const response = await fetch(`${apiUrl}/api/pricing/billing`);

    expect(response.status).toBe(401);
  });

  it('stores the start, returns it, and clears it', async () => {
    const saved = await put({ startDate: '2023-03-03' });
    expect(saved.status).toBe(200);
    expect(await saved.json()).toEqual({ startDate: '2023-03-03' });

    const read = await fetch(`${apiUrl}/api/pricing/billing`, { headers });
    expect(await read.json()).toEqual({ startDate: '2023-03-03' });

    const cleared = await put({ startDate: null });
    expect(await cleared.json()).toEqual({ startDate: null });
  });

  it('keeps the installation cost when the start changes', async () => {
    const cost = await fetch(`${apiUrl}/api/pricing/installation`, {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
    const before = await cost.json();

    await put({ startDate: '2024-02-29' });

    const after = await fetch(`${apiUrl}/api/pricing/installation`, { headers });
    expect(await after.json()).toEqual(before);
  });

  it('refuses a day that does not exist', async () => {
    const response = await put({ startDate: '2023-02-30' });

    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toContain('application/problem+json');
  });
});
