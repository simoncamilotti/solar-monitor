import Axios from 'axios';

export const errorInterceptor = (error: unknown) => {
  if (Axios.isAxiosError(error)) {
    return Promise.reject(error.response?.data ?? error);
  }
  return Promise.reject(error);
};

export const createAxiosInstance = () => {
  const instance = Axios.create({ baseURL: '/api' });

  instance.interceptors.response.use(_ => _, errorInterceptor);

  return instance;
};
