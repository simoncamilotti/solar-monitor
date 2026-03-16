import type { FeatureFlagDto } from '@/shared-models';

import { axiosInstance } from '../api/axiosInstance';

export const FeatureFlagsService = {
  getAll: (): Promise<FeatureFlagDto[]> =>
    axiosInstance.get<FeatureFlagDto[]>('feature-flags').then(({ data }) => data),
  create: (key: string, enabled: boolean): Promise<FeatureFlagDto> =>
    axiosInstance.post<FeatureFlagDto>(`feature-flags`, { key, enabled }).then(({ data }) => data),
  update: (key: string, enabled: boolean): Promise<FeatureFlagDto> =>
    axiosInstance.patch<FeatureFlagDto>(`feature-flags/${key}`, { enabled }).then(({ data }) => data),
};
