import type { LifetimeDay } from '@repo/contracts';

import { computeEnergySplit, computeSunShare } from './energy-split.js';

const day = (
  date: string,
  produced: number,
  consumed: number,
  imported: number,
  exported: number,
) =>
  ({
    date,
    kwhProduced: produced,
    kwhConsumed: consumed,
    kwhImported: imported,
    kwhExported: exported,
    gridDependency: 0,
  }) satisfies LifetimeDay;

describe('computeEnergySplit', () => {
  it('should sum the flows and derive the self-consumed energy', () => {
    const split = computeEnergySplit([
      day('2025-07-01', 20, 12, 4, 12),
      day('2025-07-02', 10, 14, 8, 4),
    ]);

    expect(split).toEqual({
      produced: 30,
      consumed: 26,
      imported: 12,
      exported: 16,
      selfConsumed: 14,
    });
  });

  it('should never report a negative self-consumption', () => {
    expect(computeEnergySplit([day('2025-07-01', 5, 3, 3, 5.2)]).selfConsumed).toBe(0);
  });

  it('should be all zeros without entries', () => {
    expect(computeEnergySplit([])).toEqual({
      produced: 0,
      consumed: 0,
      imported: 0,
      exported: 0,
      selfConsumed: 0,
    });
  });
});

describe('computeSunShare', () => {
  it('should share the self-consumed energy between production and consumption', () => {
    const share = computeSunShare(computeEnergySplit([day('2025-07-01', 20, 16, 6, 10)]));

    expect(share.productionUsedOnSite).toBe(50);
    expect(share.consumptionFromSun).toBeCloseTo(62.5);
  });

  it('should cap a share at 100 %', () => {
    const share = computeSunShare(computeEnergySplit([day('2025-07-01', 10, 4, 0, 2)]));

    expect(share.consumptionFromSun).toBe(100);
  });

  it('should have no share without production or consumption', () => {
    expect(computeSunShare(computeEnergySplit([]))).toEqual({
      productionUsedOnSite: null,
      consumptionFromSun: null,
    });
  });
});
