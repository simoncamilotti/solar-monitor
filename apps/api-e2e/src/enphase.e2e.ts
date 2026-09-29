import { ENPHASE_FIXTURE, uniqueUser } from '@repo/e2e-support';
import { beforeAll, describe, expect, it } from 'vitest';
import { apiUrl, authHeader } from './context.js';

let headers: Record<string, string>;

beforeAll(async () => {
  headers = await authHeader(uniqueUser());
});

describe('GET /api/enphase/all', () => {
  it('requires a token', async () => {
    const response = await fetch(`${apiUrl}/api/enphase/all`);

    expect(response.status).toBe(401);
  });

  it('returns the stored days in kWh, oldest first', async () => {
    const response = await fetch(`${apiUrl}/api/enphase/all`, { headers });

    expect(response.status).toBe(200);
    const days = (await response.json()) as { date: string }[];
    expect(days.map((day) => day.date)).toEqual(ENPHASE_FIXTURE.days.map((day) => day.date));
    expect(days[0]).toEqual({
      date: '2024-01-15',
      kwhProduced: 12.5,
      kwhConsumed: 8.3,
      kwhImported: 2.1,
      kwhExported: 6.3,
      gridDependency: expect.closeTo(25.3, 1),
    });
  });
});

describe('GET /api/enphase/sync-status', () => {
  it('measures the coverage of each system', async () => {
    const response = await fetch(`${apiUrl}/api/enphase/sync-status`, { headers });

    expect(response.status).toBe(200);
    const statuses = (await response.json()) as { systemId: number }[];
    expect(statuses.find((status) => status.systemId === 1)).toMatchObject({
      lastSyncDate: '2024-06-10',
      totalRecords: 6,
      // 2024-01-15 to 2024-06-10, both included.
      expectedRecords: 148,
    });
    expect(statuses.find((status) => status.systemId === 2)).toEqual({
      systemId: 2,
      lastSyncDate: null,
      totalRecords: 0,
      expectedRecords: 0,
      gaps: [],
    });
  });
});

describe('/api/enphase/sync-schedule', () => {
  it('returns the time of the daily sync', async () => {
    const response = await fetch(`${apiUrl}/api/enphase/sync-schedule`, { headers });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ syncTime: expect.stringMatching(/^\d{2}:\d{2}$/) });
  });

  it('rejects a malformed time', async () => {
    const response = await fetch(`${apiUrl}/api/enphase/sync-schedule`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ syncTime: '25:99' }),
    });

    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toContain('application/problem+json');
  });
});
