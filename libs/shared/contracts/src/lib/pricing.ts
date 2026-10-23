import { z } from 'zod';

/** A calendar day, not a point in time: always `yyyy-MM-dd`. */
const daySchema = z.iso.date();

/** `purchase`: what the household pays for a kWh drawn from the grid. `feedIn`: what it earns for a kWh sold. */
export const tariffKindSchema = z.enum(['purchase', 'feedIn']).meta({ id: 'TariffKind' });
export type TariffKind = z.infer<typeof tariffKindSchema>;

/** Euros per kWh, at most five decimals as stored. */
const pricePerKwhSchema = z.number().positive().max(999).multipleOf(0.00001);

export const tariffSchema = z
  .object({
    id: z.uuid(),
    kind: tariffKindSchema,
    pricePerKwh: z.number(),
    /** First day the price applies; it holds until the next tariff of the same kind. */
    effectiveFrom: daySchema,
  })
  .meta({ id: 'Tariff' });
export type Tariff = z.infer<typeof tariffSchema>;

export const tariffCreateSchema = z
  .object({
    kind: tariffKindSchema,
    pricePerKwh: pricePerKwhSchema,
    effectiveFrom: daySchema,
  })
  .meta({ id: 'TariffCreate' });
export type TariffCreate = z.infer<typeof tariffCreateSchema>;

export const tariffIdSchema = z.uuid();

/** The household's installation. Read and written with the same shape. */
export const installationSchema = z
  .object({
    /** Total cost in euros, `null` while unknown. */
    cost: z.number().nonnegative().max(9_999_999_999).multipleOf(0.01).nullable(),
  })
  .meta({ id: 'Installation' });
export type Installation = z.infer<typeof installationSchema>;
