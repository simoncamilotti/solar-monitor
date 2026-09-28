import type { EnphaseBackfillResult, SyncSchedule, SyncStatus } from '@repo/contracts';

import { axiosInstance } from '../api/axios-instance.js';

export const SyncService = {
  getStatus: (): Promise<SyncStatus[]> =>
    axiosInstance.get<SyncStatus[]>('enphase/sync-status').then(({ data }) => data),
  triggerSync: (systemId: number): Promise<{ message: string }> =>
    axiosInstance.post<{ message: string }>('enphase/sync', { systemId }).then(({ data }) => data),
  triggerBackfill: (
    systemId: number,
    startDate: string,
    endDate: string,
  ): Promise<EnphaseBackfillResult> =>
    axiosInstance
      .post<EnphaseBackfillResult>('enphase/backfill', { systemId, startDate, endDate })
      .then(({ data }) => data),
  getSchedule: (): Promise<SyncSchedule> =>
    axiosInstance.get<SyncSchedule>('enphase/sync-schedule').then(({ data }) => data),
  updateSchedule: (syncTime: string): Promise<SyncSchedule> =>
    axiosInstance.put<SyncSchedule>('enphase/sync-schedule', { syncTime }).then(({ data }) => data),
};
