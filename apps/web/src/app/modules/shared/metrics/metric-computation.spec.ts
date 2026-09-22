import type { LifetimeDataDto } from '@/shared-models';

import { aggregateEntries, computeMetric } from './metric-computation';

const entry = (overrides: Partial<LifetimeDataDto>): LifetimeDataDto => ({
  date: '2026-01-01',
  kwhProduced: 0,
  kwhConsumed: 0,
  kwhImported: 0,
  kwhExported: 0,
  gridDependency: 0,
  ...overrides,
});

describe('aggregateEntries', () => {
  it('should sum each energy field across entries', () => {
    const entries = [
      entry({ kwhProduced: 10, kwhConsumed: 8, kwhImported: 2, kwhExported: 4 }),
      entry({ kwhProduced: 5, kwhConsumed: 6, kwhImported: 1, kwhExported: 0 }),
    ];

    const result = aggregateEntries(entries);

    expect(result.produced).toBe(15);
    expect(result.consumed).toBe(14);
    expect(result.imported).toBe(3);
    expect(result.exported).toBe(4);
  });

  it('should compute autonomy, self-consumption and grid dependency from the totals', () => {
    // produced=10, consumed=8, imported=2, exported=4
    const entries = [entry({ kwhProduced: 10, kwhConsumed: 8, kwhImported: 2, kwhExported: 4 })];

    const result = aggregateEntries(entries);

    expect(result.autonomy).toBeCloseTo((1 - 2 / 8) * 100, 5);
    expect(result.selfConsumption).toBeCloseTo(((10 - 4) / 10) * 100, 5);
    expect(result.gridDependency).toBeCloseTo((2 / 8) * 100, 5);
  });

  it('should return all zeros for an empty entry list', () => {
    const result = aggregateEntries([]);

    expect(result).toEqual({
      produced: 0,
      consumed: 0,
      imported: 0,
      exported: 0,
      autonomy: 0,
      selfConsumption: 0,
      gridDependency: 0,
    });
  });

  it('should not divide by zero when consumption is zero', () => {
    const entries = [entry({ kwhProduced: 10, kwhConsumed: 0, kwhImported: 0, kwhExported: 5 })];

    const result = aggregateEntries(entries);

    expect(result.autonomy).toBe(0);
    expect(result.gridDependency).toBe(0);
    expect(Number.isFinite(result.autonomy)).toBe(true);
    expect(Number.isFinite(result.gridDependency)).toBe(true);
  });

  it('should not divide by zero when production is zero', () => {
    const entries = [entry({ kwhProduced: 0, kwhConsumed: 10, kwhImported: 10, kwhExported: 0 })];

    const result = aggregateEntries(entries);

    expect(result.selfConsumption).toBe(0);
    expect(Number.isFinite(result.selfConsumption)).toBe(true);
  });

  it('should return zero for every field when production and consumption are both zero', () => {
    const entries = [entry({ kwhProduced: 0, kwhConsumed: 0, kwhImported: 0, kwhExported: 0 })];

    const result = aggregateEntries(entries);

    expect(result.autonomy).toBe(0);
    expect(result.selfConsumption).toBe(0);
    expect(result.gridDependency).toBe(0);
  });
});

describe('computeMetric', () => {
  const entries = [entry({ kwhProduced: 10, kwhConsumed: 8, kwhImported: 2, kwhExported: 4 })];
  const aggregated = aggregateEntries(entries);

  it.each([
    ['kwhProduced', aggregated.produced],
    ['kwhConsumed', aggregated.consumed],
    ['kwhImported', aggregated.imported],
    ['kwhExported', aggregated.exported],
    ['autonomy', aggregated.autonomy],
    ['selfConsumption', aggregated.selfConsumption],
    ['gridDependency', aggregated.gridDependency],
  ] as const)('should return the %s field from the aggregation', (metric, expected) => {
    expect(computeMetric(metric, entries)).toBe(expected);
  });

  it('should return 0 for an empty entry list regardless of metric', () => {
    expect(computeMetric('kwhProduced', [])).toBe(0);
    expect(computeMetric('autonomy', [])).toBe(0);
  });
});
