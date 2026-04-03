import type { SyncStatusResponseDto } from '@/shared-models';

import { axiosInstance } from '../api/axiosInstance';

export const SyncService = {
  getStatus: (): Promise<SyncStatusResponseDto> =>
    axiosInstance.get<SyncStatusResponseDto>('enphase/sync-status').then(({ data }) => data),
  triggerSync: (systemId: number): Promise<{ message: string }> =>
    axiosInstance.get<{ message: string }>(`enphase/sync?system_id=${systemId}`).then(({ data }) => data),
};
