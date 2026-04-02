import type { InternalAxiosRequestConfig } from 'axios';
import Axios from 'axios';

vi.mock('../auth/auth', () => ({
  getStoredToken: vi.fn(),
}));

import { getStoredToken } from '../auth/auth';
import { axiosInstance } from './axiosInstance';

const mockedGetStoredToken = vi.mocked(getStoredToken);

describe('axiosInstance', () => {
  it('should have /api as baseURL', () => {
    expect(axiosInstance.defaults.baseURL).toBe('/api');
  });

  describe('auth request interceptor', () => {
    const runRequestInterceptor = (config: InternalAxiosRequestConfig) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const interceptor = (axiosInstance.interceptors.request as any).handlers[0].fulfilled;
      return interceptor(config);
    };

    it('should add Authorization header when token exists', () => {
      mockedGetStoredToken.mockReturnValue('my-jwt-token');

      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = runRequestInterceptor(config);

      expect(result.headers.authorization).toBe('Bearer my-jwt-token');
    });

    it('should not add Authorization header when token is null', () => {
      mockedGetStoredToken.mockReturnValue(null);

      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = runRequestInterceptor(config);

      expect(result.headers.authorization).toBeUndefined();
    });

    it('should not add Authorization header when token is empty', () => {
      mockedGetStoredToken.mockReturnValue('');

      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = runRequestInterceptor(config);

      expect(result.headers.authorization).toBeUndefined();
    });
  });

  describe('error interceptor', () => {
    const runErrorInterceptor = (error: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const interceptor = (axiosInstance.interceptors.response as any).handlers[0].rejected;
      return interceptor(error);
    };

    it('should extract response data from AxiosError', async () => {
      const error = new Axios.AxiosError('Bad Request', '400', undefined, undefined, {
        data: { message: 'Validation failed' },
      } as never);

      await expect(runErrorInterceptor(error)).rejects.toEqual({ message: 'Validation failed' });
    });

    it('should fallback to error itself when no response data', async () => {
      const error = new Axios.AxiosError('Network Error', 'ERR_NETWORK');

      await expect(runErrorInterceptor(error)).rejects.toBe(error);
    });

    it('should reject non-Axios errors as-is', async () => {
      const error = new Error('Unknown error');

      await expect(runErrorInterceptor(error)).rejects.toBe(error);
    });
  });

  describe('forbidden interceptor', () => {
    const runForbiddenInterceptor = (error: unknown) => {
      // errorInterceptor from createAxiosInstance is at index 0, forbiddenInterceptor is at index 1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const interceptor = (axiosInstance.interceptors.response as any).handlers[1].rejected;
      return interceptor(error);
    };

    it('should redirect to /forbidden on 401 error', async () => {
      const originalHref = window.location.href;
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, pathname: '/', href: '' },
      });

      const error = new Axios.AxiosError('Unauthorized', '401', undefined, undefined, {
        status: 401,
      } as never);

      await expect(runForbiddenInterceptor(error)).rejects.toBeDefined();
      expect(window.location.href).toBe('/forbidden');

      Object.defineProperty(window, 'location', { writable: true, value: { href: originalHref } });
    });

    it('should not redirect if already on /forbidden', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, pathname: '/forbidden', href: '' },
      });

      const error = new Axios.AxiosError('Unauthorized', '401', undefined, undefined, {
        status: 401,
      } as never);

      await expect(runForbiddenInterceptor(error)).rejects.toBeDefined();
      expect(window.location.href).toBe('');

      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } });
    });

    it('should not redirect on non-401 errors', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, pathname: '/', href: '' },
      });

      const error = new Axios.AxiosError('Forbidden', '403', undefined, undefined, {
        status: 403,
      } as never);

      await expect(runForbiddenInterceptor(error)).rejects.toBeDefined();
      expect(window.location.href).toBe('');

      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } });
    });
  });
});
