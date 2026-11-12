import { z } from 'zod';

/** A calendar day, not a point in time: always `yyyy-MM-dd`. */
const daySchema = z.iso.date();

/** Trimmed, so that « Été 2024 » and « Été 2024 » are the same name. */
const nameSchema = z.string().trim().min(1).max(60);

const startNotAfterEnd = {
  message: 'startDate must not be after endDate',
  path: ['endDate'],
};

/** A named range of days, both bounds included, shared by the household. */
export const dateRangeSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    startDate: daySchema,
    endDate: daySchema,
  })
  .meta({ id: 'DateRange' });
export type DateRange = z.infer<typeof dateRangeSchema>;

export const dateRangeCreateSchema = z
  .object({
    name: nameSchema,
    startDate: daySchema,
    endDate: daySchema,
  })
  .refine(({ startDate, endDate }) => startDate <= endDate, startNotAfterEnd)
  .meta({ id: 'DateRangeCreate' });
export type DateRangeCreate = z.infer<typeof dateRangeCreateSchema>;

/** Any subset of the fields; the bounds are checked against the stored ones when only one is sent. */
export const dateRangeUpdateSchema = z
  .object({
    name: nameSchema.optional(),
    startDate: daySchema.optional(),
    endDate: daySchema.optional(),
  })
  .refine(
    ({ startDate, endDate }) => !startDate || !endDate || startDate <= endDate,
    startNotAfterEnd,
  )
  .meta({ id: 'DateRangeUpdate' });
export type DateRangeUpdate = z.infer<typeof dateRangeUpdateSchema>;

export const dateRangeIdSchema = z.uuid();
