import Axios from 'axios';

import { createAxiosInstance, errorInterceptor } from './axiosInstance';

describe('createAxiosInstance', () => {
  it('should create an instance with /api as baseURL', () => {
    const instance = createAxiosInstance();

    expect(instance.defaults.baseURL).toBe('/api');
  });

  it('should register the error response interceptor', () => {
    const instance = createAxiosInstance();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlers = (instance.interceptors.response as any).handlers;

    expect(handlers).toHaveLength(1);
    expect(handlers[0].rejected).toBeDefined();
  });
});

describe('errorInterceptor', () => {
  it('should extract response data from AxiosError', async () => {
    const error = new Axios.AxiosError('Bad Request', '400', undefined, undefined, {
      data: { message: 'Validation failed' },
    } as never);

    await expect(errorInterceptor(error)).rejects.toEqual({ message: 'Validation failed' });
  });

  it('should fallback to error itself when no response data', async () => {
    const error = new Axios.AxiosError('Network Error', 'ERR_NETWORK');

    await expect(errorInterceptor(error)).rejects.toBe(error);
  });

  it('should reject non-Axios errors as-is', async () => {
    const error = new Error('Unknown error');

    await expect(errorInterceptor(error)).rejects.toBe(error);
  });
});
