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
export type SyncStatusDto = z.infer<typeof syncStatusDtoSchema>;
export type SyncStatusResponseDto = z.infer<typeof syncStatusResponseDtoSchema>;
