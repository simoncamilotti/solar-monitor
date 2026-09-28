import axios from 'axios';

describe('GET /api/health/ready', () => {
  it('should return a healthy status', async () => {
    const res = await axios.get('/api/health/ready');

    expect(res.status).toBe(200);
    expect(res.data).toEqual(
      expect.objectContaining({
        status: 'ok',
      }),
    );
  });
});
