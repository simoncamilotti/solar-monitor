import type { LifetimeDataResponseDto } from '@repo/contracts';

import { axiosInstance } from '../api/axios-instance.js';

export const HistoryService = {
  getAll: (): Promise<LifetimeDataResponseDto> =>
    axiosInstance.get<LifetimeDataResponseDto>('enphase/all').then(({ data }) => data),
};
