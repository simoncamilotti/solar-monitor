import type { AxiosError } from 'axios';
import axios from 'axios';

import { getKeycloakToken } from '../support/keycloak-helper';

describe('Authentication', () => {
  describe('Protected route (GET /api)', () => {
    it('should return 401 without a token', async () => {
      const error = await axios.get('/api/enphase/sync-status').catch((e: AxiosError) => e);

      expect(axios.isAxiosError(error)).toBe(true);
      expect((error as AxiosError).response?.status).toBe(401);
    });

    it('should return 401 with an invalid token', async () => {
      const error = await axios
        .get('/api/enphase/sync-status', {
          headers: { Authorization: 'Bearer invalid-token' },
        })
        .catch((e: AxiosError) => e);

      expect(axios.isAxiosError(error)).toBe(true);
      expect((error as AxiosError).response?.status).toBe(401);
    });

    it('should return 200 with a valid Keycloak token', async () => {
      const token = await getKeycloakToken();

      const res = await axios.get('/api/enphase/sync-status', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
    });
  });

  describe('Public route (GET /health)', () => {
    it('should return 200 without a token', async () => {
      const res = await axios.get('/health');

      expect(res.status).toBe(200);
      expect(res.data).toEqual(
        expect.objectContaining({
          status: 'ok',
        }),
      );
    });
  });
});
