import type { InternalAxiosRequestConfig } from 'axios';
import Axios from 'axios';

import { RoutePaths } from '../../routes/paths.const';
import { getStoredToken } from '../auth/auth';

const errorInterceptor = (error: unknown) => {
  if (Axios.isAxiosError(error)) {
    return Promise.reject(error.response?.data ?? error);
  }
  return Promise.reject(error);
};

const instance = Axios.create({ baseURL: '/api' });
instance.interceptors.response.use(_ => _, errorInterceptor);

export const axiosInstance = instance;

const authRequestInterceptor = (config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {};

  const token = getStoredToken();
  if (token != null && token !== '') {
    config.headers.authorization = `Bearer ${token}`;
  }

  return config;
};

const excludedErrorPaths: string[] = [RoutePaths.ERROR_FORBIDDEN];
const forbiddenInterceptor = (error: unknown) => {
  if (
    Axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    !excludedErrorPaths.includes(window.location.pathname)
  ) {
    window.location.href = RoutePaths.ERROR_FORBIDDEN;
  }

  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(authRequestInterceptor);
axiosInstance.interceptors.response.use(_ => _, forbiddenInterceptor);
