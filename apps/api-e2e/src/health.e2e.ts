import { describe, expect, it } from 'vitest';
import { apiUrl } from './context.js';

describe('health', () => {
  it('is ready once connected to the database', async () => {
    const response = await fetch(`${apiUrl}/api/health/ready`);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ info: { database: { status: 'up' } } });
  });
});
