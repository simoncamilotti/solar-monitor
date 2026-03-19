import type { LifetimeDataResponseDto } from '@/shared-models';

import { axiosInstance } from '../api/axiosInstance';

export const HistoryService = {
  getAll: (): Promise<LifetimeDataResponseDto> =>
    axiosInstance.get<LifetimeDataResponseDto>('enphase/all').then(({ data }) => data),
};
