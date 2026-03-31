import type { AxiosError } from 'axios';
import axios from 'axios';

import { getKeycloakToken } from '../support/keycloak-helper';

describe('Feature Flags API', () => {
  let token: string;
  const createdKeys: string[] = [];

  beforeAll(async () => {
    token = await getKeycloakToken();
  });

  afterAll(async () => {
    for (const key of createdKeys) {
      await axios.delete(`/api/feature-flags/${key}`, authHeaders()).catch(() => undefined);
    }
  });

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  describe('GET /api/feature-flags', () => {
    it('should return 401 without a token', async () => {
      const error = await axios.get('/api/feature-flags').catch((e: AxiosError) => e);

      expect(axios.isAxiosError(error)).toBe(true);
      expect((error as AxiosError).response?.status).toBe(401);
    });

    it('should return an array of feature flags', async () => {
      const res = await axios.get('/api/feature-flags', authHeaders());

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('POST /api/feature-flags', () => {
    it('should return 401 without a token', async () => {
      const error = await axios
        .post('/api/feature-flags', { key: 'test-no-auth', enabled: false })
        .catch((e: AxiosError) => e);

      expect(axios.isAxiosError(error)).toBe(true);
      expect((error as AxiosError).response?.status).toBe(401);
    });

    it('should create a new feature flag', async () => {
      const key = `e2e-test-${Date.now()}`;
      const res = await axios.post('/api/feature-flags', { key, enabled: false }, authHeaders());

      createdKeys.push(key);
      expect(res.status).toBe(201);
      expect(res.data).toEqual(
        expect.objectContaining({
          key,
          enabled: false,
        }),
      );
    });

    it('should return the created flag in the list', async () => {
      const key = `e2e-list-${Date.now()}`;
      await axios.post('/api/feature-flags', { key, enabled: true }, authHeaders());
      createdKeys.push(key);

      const res = await axios.get('/api/feature-flags', authHeaders());
      const found = res.data.find((f: { key: string }) => f.key === key);

      expect(found).toBeDefined();
      expect(found.enabled).toBe(true);
    });
  });

  describe('PATCH /api/feature-flags/:key', () => {
    it('should return 401 without a token', async () => {
      const error = await axios.patch('/api/feature-flags/some-key', { enabled: true }).catch((e: AxiosError) => e);

      expect(axios.isAxiosError(error)).toBe(true);
      expect((error as AxiosError).response?.status).toBe(401);
    });

    it('should update a feature flag', async () => {
      const key = `e2e-update-${Date.now()}`;
      await axios.post('/api/feature-flags', { key, enabled: false }, authHeaders());
      createdKeys.push(key);

      const res = await axios.patch(`/api/feature-flags/${key}`, { enabled: true }, authHeaders());

      expect(res.status).toBe(200);
      expect(res.data).toEqual(
        expect.objectContaining({
          key,
          enabled: true,
        }),
      );
    });

    it('should return 404 for a non-existent flag', async () => {
      const error = await axios
        .patch('/api/feature-flags/non-existent-flag', { enabled: true }, authHeaders())
        .catch((e: AxiosError) => e);

      expect(axios.isAxiosError(error)).toBe(true);
      expect((error as AxiosError).response?.status).toBe(404);
    });
  });

  describe('DELETE /api/feature-flags/:key', () => {
    it('should return 401 without a token', async () => {
      const error = await axios.delete('/api/feature-flags/some-key').catch((e: AxiosError) => e);

      expect(axios.isAxiosError(error)).toBe(true);
      expect((error as AxiosError).response?.status).toBe(401);
    });

    it('should delete a feature flag', async () => {
      const key = `e2e-delete-${Date.now()}`;
      await axios.post('/api/feature-flags', { key, enabled: false }, authHeaders());

      const res = await axios.delete(`/api/feature-flags/${key}`, authHeaders());

      expect(res.status).toBe(204);

      const list = await axios.get('/api/feature-flags', authHeaders());
      const found = list.data.find((f: { key: string }) => f.key === key);
      expect(found).toBeUndefined();
    });

    it('should return 404 for a non-existent flag', async () => {
      const error = await axios
        .delete('/api/feature-flags/non-existent-flag', authHeaders())
        .catch((e: AxiosError) => e);

      expect(axios.isAxiosError(error)).toBe(true);
      expect((error as AxiosError).response?.status).toBe(404);
    });
  });
});
