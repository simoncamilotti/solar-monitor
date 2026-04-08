import type { EnphaseBackfillResponseDto, SyncScheduleDto, SyncStatusResponseDto } from '@/shared-models';

import { axiosInstance } from '../api/axiosInstance';

export const SyncService = {
  getStatus: (): Promise<SyncStatusResponseDto> =>
    axiosInstance.get<SyncStatusResponseDto>('enphase/sync-status').then(({ data }) => data),
  triggerSync: (systemId: number): Promise<{ message: string }> =>
    axiosInstance.get<{ message: string }>(`enphase/sync?system_id=${systemId}`).then(({ data }) => data),
  triggerBackfill: (systemId: number, startDate: string, endDate: string): Promise<EnphaseBackfillResponseDto> =>
    axiosInstance
      .get<EnphaseBackfillResponseDto>(
        `enphase/backfill?system_id=${systemId}&start_date=${startDate}&end_date=${endDate}`,
      )
      .then(({ data }) => data),
  getSchedule: (): Promise<SyncScheduleDto> =>
    axiosInstance.get<SyncScheduleDto>('enphase/sync-schedule').then(({ data }) => data),
  updateSchedule: (syncTime: string): Promise<SyncScheduleDto> =>
    axiosInstance.put<SyncScheduleDto>('enphase/sync-schedule', { syncTime }).then(({ data }) => data),
};
