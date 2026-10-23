import { randomUUID } from 'node:crypto';

import { uniqueUser } from '@repo/e2e-support';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { apiUrl, authHeader } from './context.js';

// Saved ranges belong to the household, not to a user: every name is unique to this run, and
// each range is deleted afterwards so that no other suite sees it.
const name = (label: string) => `${label} ${randomUUID()}`;

describe('/api/date-ranges', () => {
  let headers: Record<string, string>;
  const created: string[] = [];

  const create = (body: unknown) =>
    fetch(`${apiUrl}/api/date-ranges`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  beforeAll(async () => {
    headers = await authHeader(uniqueUser());
  });

  afterAll(async () => {
    await Promise.all(
      created.map((id) => fetch(`${apiUrl}/api/date-ranges/${id}`, { method: 'DELETE', headers })),
    );
  });

  it('requires a token', async () => {
    const response = await fetch(`${apiUrl}/api/date-ranges`);

    expect(response.status).toBe(401);
  });

  it('saves a range and lists it', async () => {
    const body = { name: name('Été'), startDate: '2024-06-21', endDate: '2024-09-22' };

    const response = await create(body);
    const range = (await response.json()) as { id: string };
    created.push(range.id);

    expect(response.status).toBe(201);
    expect(range).toEqual({ id: expect.any(String), ...body });
    const list = (await (await fetch(`${apiUrl}/api/date-ranges`, { headers })).json()) as {
      id: string;
    }[];
    expect(list).toContainEqual(range);
  });

  it('refuses a name already taken with a 409 problem', async () => {
    const body = { name: name('Doublon'), startDate: '2024-01-01', endDate: '2024-01-07' };
    const first = (await (await create(body)).json()) as { id: string };
    created.push(first.id);

    const response = await create(body);

    expect(response.status).toBe(409);
    expect(response.headers.get('content-type')).toContain('application/problem+json');
  });

  it('refuses a start after the end', async () => {
    const response = await create({
      name: name('Inversée'),
      startDate: '2024-02-10',
      endDate: '2024-02-01',
    });

    expect(response.status).toBe(400);
  });

  it('renames a range, then deletes it', async () => {
    const range = (await (
      await create({ name: name('Avant'), startDate: '2024-03-01', endDate: '2024-03-31' })
    ).json()) as { id: string };
    const renamed = name('Après');

    const patch = await fetch(`${apiUrl}/api/date-ranges/${range.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: renamed }),
    });
    const deleted = await fetch(`${apiUrl}/api/date-ranges/${range.id}`, {
      method: 'DELETE',
      headers,
    });
    const again = await fetch(`${apiUrl}/api/date-ranges/${range.id}`, {
      method: 'DELETE',
      headers,
    });

    expect(patch.status).toBe(200);
    expect(await patch.json()).toMatchObject({ name: renamed, startDate: '2024-03-01' });
    expect(deleted.status).toBe(204);
    expect(again.status).toBe(404);
  });
});
