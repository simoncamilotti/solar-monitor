import type { LifetimeDay, Tariff } from '@repo/contracts';

import { computeInvestmentReturn, computeSavings, priceOn } from './savings-computation.js';

const day = (date: string, produced: number, exported: number): LifetimeDay => ({
  date,
  kwhProduced: produced,
  kwhConsumed: 10,
  kwhImported: 0,
  kwhExported: exported,
  gridDependency: 0,
});

const tariff = (kind: Tariff['kind'], pricePerKwh: number, effectiveFrom: string): Tariff => ({
  id: `${kind}-${effectiveFrom}`,
  kind,
  pricePerKwh,
  effectiveFrom,
});

describe('priceOn', () => {
  const tariffs = [
    tariff('purchase', 0.25, '2025-02-01'),
    tariff('purchase', 0.2, '2025-01-01'),
    tariff('feedIn', 0.04, '2025-01-01'),
  ];

  it('should pick the latest tariff started on or before the day, whatever the order', () => {
    expect(priceOn(tariffs, 'purchase', '2025-01-31')).toBe(0.2);
    expect(priceOn(tariffs, 'purchase', '2025-02-01')).toBe(0.25);
    expect(priceOn(tariffs, 'purchase', '2025-06-15')).toBe(0.25);
  });

  it('should keep the kinds apart', () => {
    expect(priceOn(tariffs, 'feedIn', '2025-02-15')).toBe(0.04);
  });

  it('should return null before the first tariff', () => {
    expect(priceOn(tariffs, 'purchase', '2024-12-31')).toBeNull();
  });
});

describe('computeSavings', () => {
  it('should value each day at the tariff in force that day', () => {
    // January at 0.20 €, February at 0.25 €: 6 kWh used on site each day.
    const days = [day('2025-01-31', 10, 4), day('2025-02-01', 10, 4)];
    const tariffs = [
      tariff('purchase', 0.2, '2025-01-01'),
      tariff('purchase', 0.25, '2025-02-01'),
      tariff('feedIn', 0.1, '2025-01-01'),
    ];

    const result = computeSavings(days, tariffs);

    expect(result.savings).toBeCloseTo(6 * 0.2 + 6 * 0.25);
    expect(result.revenue).toBeCloseTo(8 * 0.1);
    expect(result.total).toBeCloseTo(2.7 + 0.8);
    expect(result.unpricedDays).toBe(0);
  });

  it('should count the days without a price, and value nothing for them', () => {
    const days = [day('2024-12-31', 10, 4), day('2025-01-01', 10, 4)];
    const tariffs = [tariff('purchase', 0.2, '2025-01-01')];

    const result = computeSavings(days, tariffs);

    expect(result.savings).toBeCloseTo(1.2);
    expect(result.revenue).toBe(0);
    expect(result.unpricedDays).toBe(2);
  });

  it('should be zero without any tariff', () => {
    expect(computeSavings([day('2025-01-01', 10, 4)], [])).toEqual({
      savings: 0,
      revenue: 0,
      total: 0,
      unpricedDays: 1,
    });
  });

  it('should not count a negative self-consumption', () => {
    const result = computeSavings([day('2025-01-01', 2, 3)], [tariff('purchase', 1, '2025-01-01')]);

    expect(result.savings).toBe(0);
  });
});

describe('computeInvestmentReturn', () => {
  const tariffs = [tariff('purchase', 1, '2025-01-01'), tariff('feedIn', 1, '2025-01-01')];

  it('should estimate the payback day at the recent pace', () => {
    // 10 € a day, 30 € gained, 100 € cost: 7 more days after the last one.
    const days = [day('2025-01-01', 10, 0), day('2025-01-02', 10, 0), day('2025-01-03', 10, 0)];

    const result = computeInvestmentReturn(days, tariffs, 100);

    expect(result.gained).toBe(30);
    expect(result.share).toBeCloseTo(0.3);
    expect(result.paidBack).toBe(false);
    expect(result.paybackDay).toBe('2025-01-10');
  });

  it('should give the day the cost was reached once paid back', () => {
    const days = [day('2025-01-01', 10, 0), day('2025-01-02', 10, 0), day('2025-01-03', 10, 0)];

    const result = computeInvestmentReturn(days, tariffs, 15);

    expect(result.paidBack).toBe(true);
    expect(result.share).toBe(1);
    expect(result.paybackDay).toBe('2025-01-02');
  });

  it('should not estimate a payback day without any gain', () => {
    const result = computeInvestmentReturn([day('2025-01-01', 10, 0)], [], 100);

    expect(result.paybackDay).toBeNull();
    expect(result.paidBack).toBe(false);
  });
});
