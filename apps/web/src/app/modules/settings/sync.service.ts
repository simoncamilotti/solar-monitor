import type { EnphaseBackfillResponseDto, SyncScheduleDto, SyncStatusResponseDto } from '@/shared-models';

import { axiosInstance } from '../api/axiosInstance';

export const SyncService = {
  getStatus: (): Promise<SyncStatusResponseDto> =>
    axiosInstance.get<SyncStatusResponseDto>('enphase/sync-status').then(({ data }) => data),
  triggerSync: (systemId: number): Promise<{ message: string }> =>
    axiosInstance.post<{ message: string }>('enphase/sync', { systemId }).then(({ data }) => data),
  triggerBackfill: (systemId: number, startDate: string, endDate: string): Promise<EnphaseBackfillResponseDto> =>
    axiosInstance
      .post<EnphaseBackfillResponseDto>('enphase/backfill', { systemId, startDate, endDate })
      .then(({ data }) => data),
  getSchedule: (): Promise<SyncScheduleDto> =>
    axiosInstance.get<SyncScheduleDto>('enphase/sync-schedule').then(({ data }) => data),
  updateSchedule: (syncTime: string): Promise<SyncScheduleDto> =>
    axiosInstance.put<SyncScheduleDto>('enphase/sync-schedule', { syncTime }).then(({ data }) => data),
};
