import type { LifetimeDay } from '@repo/contracts';

/** Where the energy of a period went, in kWh. */
export type EnergySplit = {
  produced: number;
  consumed: number;
  /** Produced and used on site: what the house did not have to buy. */
  selfConsumed: number;
  imported: number;
  exported: number;
};

/** Shares of the self-consumed energy, in %: `null` when there is nothing to share. */
export type SunShare = {
  /** Part of the production used on site; the rest was exported. */
  productionUsedOnSite: number | null;
  /** Part of the consumption covered by the sun; the rest was imported. */
  consumptionFromSun: number | null;
};

export const computeEnergySplit = (entries: LifetimeDay[]): EnergySplit => {
  let produced = 0;
  let consumed = 0;
  let imported = 0;
  let exported = 0;
  for (const e of entries) {
    produced += e.kwhProduced;
    consumed += e.kwhConsumed;
    imported += e.kwhImported;
    exported += e.kwhExported;
  }
  // Meter rounding can export a hair more than was produced: never a negative self-consumption.
  const selfConsumed = Math.max(0, produced - exported);
  return { produced, consumed, selfConsumed, imported, exported };
};

const share = (part: number, whole: number): number | null =>
  whole > 0 ? Math.min(100, (part / whole) * 100) : null;

export const computeSunShare = (split: EnergySplit): SunShare => ({
  productionUsedOnSite: share(split.selfConsumed, split.produced),
  consumptionFromSun: share(split.selfConsumed, split.consumed),
});
