import { z } from 'zod';

export const enphaseSystemDtoSchema = z.object({
  id: z.int(),
  name: z.string(),
  timezone: z.string(),
});

export const enphaseCallbackResponseDtoSchema = z.object({
  message: z.string(),
  systems: z.array(enphaseSystemDtoSchema),
});

export const enphaseSyncResponseDtoSchema = z.object({
  message: z.string(),
});

export const enphaseBackfillResponseDtoSchema = z.object({
  message: z.string(),
  daysBackfilled: z.int(),
});

export const lifetimeDataDtoSchema = z.object({
  date: z.date(),
  kwhProduced: z.number(),
  kwhConsumed: z.number(),
  kwhImported: z.number(),
  kwhExported: z.number(),
  gridDependency: z.number(),
});

export const lifetimeDataResponseDtoSchema = z.array(lifetimeDataDtoSchema);

export const syncStatusDtoSchema = z.object({
  systemId: z.number(),
  lastSyncDate: z.string().nullable(),
  totalRecords: z.number(),
});

export const syncStatusResponseDtoSchema = z.array(syncStatusDtoSchema);

export type LifetimeDataDto = z.infer<typeof lifetimeDataDtoSchema>;
export type LifetimeDataResponseDto = z.infer<typeof lifetimeDataResponseDtoSchema>;
export type EnphaseBackfillResponseDto = z.infer<typeof enphaseBackfillResponseDtoSchema>;
export const syncScheduleDtoSchema = z.object({
  syncTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be in HH:mm format'),
});

export const updateSyncScheduleRequestDtoSchema = syncScheduleDtoSchema;

export type SyncStatusDto = z.infer<typeof syncStatusDtoSchema>;
export type SyncStatusResponseDto = z.infer<typeof syncStatusResponseDtoSchema>;
export type SyncScheduleDto = z.infer<typeof syncScheduleDtoSchema>;
export type UpdateSyncScheduleRequestDto = z.infer<typeof updateSyncScheduleRequestDtoSchema>;
