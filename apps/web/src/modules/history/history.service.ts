import type { LifetimeDay } from '@repo/contracts';

import { axiosInstance } from '../api/axios-instance.js';

export const HistoryService = {
  getAll: (): Promise<LifetimeDay[]> =>
    axiosInstance.get<LifetimeDay[]>('enphase/all').then(({ data }) => data),
};
