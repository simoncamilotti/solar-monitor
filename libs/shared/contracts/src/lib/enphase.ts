import { z } from 'zod';

/** A calendar day, not a point in time: always `yyyy-MM-dd`, with no time or time zone to misread. */
const daySchema = z.iso.date();

export const enphaseSystemSchema = z
  .object({
    id: z.int(),
    name: z.string(),
    timezone: z.string(),
  })
  .meta({ id: 'EnphaseSystem' });
export type EnphaseSystem = z.infer<typeof enphaseSystemSchema>;

/** Answer of the OAuth2 callback once the Enphase account is linked. */
export const enphaseLinkResultSchema = z
  .object({
    message: z.string(),
    systems: z.array(enphaseSystemSchema),
  })
  .meta({ id: 'EnphaseLinkResult' });
export type EnphaseLinkResult = z.infer<typeof enphaseLinkResultSchema>;

export const enphaseSyncRequestSchema = z
  .object({
    systemId: z.int(),
  })
  .meta({ id: 'EnphaseSyncRequest' });
export type EnphaseSyncRequest = z.infer<typeof enphaseSyncRequestSchema>;

export const enphaseSyncResultSchema = z
  .object({
    message: z.string(),
  })
  .meta({ id: 'EnphaseSyncResult' });
export type EnphaseSyncResult = z.infer<typeof enphaseSyncResultSchema>;

export const enphaseBackfillRequestSchema = z
  .object({
    systemId: z.int(),
    startDate: daySchema,
    endDate: daySchema,
  })
  .refine(({ startDate, endDate }) => startDate <= endDate, {
    message: 'startDate must not be after endDate',
    path: ['endDate'],
  })
  .meta({ id: 'EnphaseBackfillRequest' });
export type EnphaseBackfillRequest = z.infer<typeof enphaseBackfillRequestSchema>;

export const enphaseBackfillResultSchema = z
  .object({
    message: z.string(),
    daysBackfilled: z.int(),
  })
  .meta({ id: 'EnphaseBackfillResult' });
export type EnphaseBackfillResult = z.infer<typeof enphaseBackfillResultSchema>;

/** Energy of one day, in kWh, and the share of it drawn from the grid, in %. */
export const lifetimeDaySchema = z
  .object({
    date: daySchema,
    kwhProduced: z.number(),
    kwhConsumed: z.number(),
    kwhImported: z.number(),
    kwhExported: z.number(),
    gridDependency: z.number(),
  })
  .meta({ id: 'LifetimeDay' });
export type LifetimeDay = z.infer<typeof lifetimeDaySchema>;

/** A range of days missing from the stored history, bounds included. */
export const syncGapSchema = z
  .object({
    from: daySchema,
    to: daySchema,
    days: z.int(),
  })
  .meta({ id: 'SyncGap' });
export type SyncGap = z.infer<typeof syncGapSchema>;

export const syncStatusSchema = z
  .object({
    systemId: z.number(),
    lastSyncDate: daySchema.nullable(),
    totalRecords: z.number(),
    /** Number of days the stored range would cover if it were complete. */
    expectedRecords: z.number(),
    gaps: z.array(syncGapSchema),
  })
  .meta({ id: 'SyncStatus' });
export type SyncStatus = z.infer<typeof syncStatusSchema>;

/** Time of the daily sync, UTC. Read and written with the same shape. */
export const syncScheduleSchema = z
  .object({
    syncTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be a time of day, HH:mm'),
  })
  .meta({ id: 'SyncSchedule' });
export type SyncSchedule = z.infer<typeof syncScheduleSchema>;
