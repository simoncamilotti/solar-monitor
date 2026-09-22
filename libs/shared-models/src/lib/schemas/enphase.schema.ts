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

export const enphaseSyncRequestDtoSchema = z.object({
  systemId: z.int(),
});

export const enphaseBackfillResponseDtoSchema = z.object({
  message: z.string(),
  daysBackfilled: z.int(),
});

export const enphaseBackfillRequestDtoSchema = z
  .object({
    systemId: z.int(),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
  })
  .refine(({ startDate, endDate }) => startDate <= endDate, {
    message: 'startDate must not be after endDate',
    path: ['endDate'],
  });

export const lifetimeDataDtoSchema = z.object({
  // A calendar date, not a point in time: the API always emits `yyyy-MM-dd`, with no time-of-day
  // or timezone component to misread.
  date: z.iso.date(),
  kwhProduced: z.number(),
  kwhConsumed: z.number(),
  kwhImported: z.number(),
  kwhExported: z.number(),
  gridDependency: z.number(),
});

export const lifetimeDataResponseDtoSchema = z.array(lifetimeDataDtoSchema);

/** A range of days missing from the stored history, bounds included. */
export const syncGapDtoSchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
  days: z.int(),
});

export const syncStatusDtoSchema = z.object({
  systemId: z.number(),
  lastSyncDate: z.string().nullable(),
  totalRecords: z.number(),
  /** Number of days the stored range would cover if it were complete. */
  expectedRecords: z.number(),
  gaps: z.array(syncGapDtoSchema),
});

export const syncStatusResponseDtoSchema = z.array(syncStatusDtoSchema);

export type LifetimeDataDto = z.infer<typeof lifetimeDataDtoSchema>;
export type LifetimeDataResponseDto = z.infer<typeof lifetimeDataResponseDtoSchema>;
export type EnphaseSyncRequestDto = z.infer<typeof enphaseSyncRequestDtoSchema>;
export type EnphaseBackfillResponseDto = z.infer<typeof enphaseBackfillResponseDtoSchema>;
export type EnphaseBackfillRequestDto = z.infer<typeof enphaseBackfillRequestDtoSchema>;
export const syncScheduleDtoSchema = z.object({
  syncTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be in HH:mm format'),
});

export const updateSyncScheduleRequestDtoSchema = syncScheduleDtoSchema;

export type SyncGapDto = z.infer<typeof syncGapDtoSchema>;
export type SyncStatusDto = z.infer<typeof syncStatusDtoSchema>;
export type SyncStatusResponseDto = z.infer<typeof syncStatusResponseDtoSchema>;
export type SyncScheduleDto = z.infer<typeof syncScheduleDtoSchema>;
export type UpdateSyncScheduleRequestDto = z.infer<typeof updateSyncScheduleRequestDtoSchema>;
