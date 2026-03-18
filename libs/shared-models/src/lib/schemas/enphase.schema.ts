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
  whProduced: z.int(),
  whConsumed: z.int(),
  whImported: z.int(),
  whExported: z.int(),
});

export const lifetimeDataResponseDtoSchema = z.array(lifetimeDataDtoSchema);

export type LifetimeDataDto = z.infer<typeof lifetimeDataDtoSchema>;
export type LifetimeDataResponseDto = z.infer<typeof lifetimeDataResponseDtoSchema>;
