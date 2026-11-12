import type { LifetimeDay, Tariff } from '@repo/contracts';

import {
  anniversaryIn,
  billingPeriodOf,
  computePeriodResale,
  currentBillingYear,
  oldestBillingYear,
} from './billing-computation.js';

const day = (date: string, kwhExported = 2): LifetimeDay => ({
  date,
  kwhProduced: 10,
  kwhConsumed: 8,
  kwhImported: 2,
  kwhExported,
  gridDependency: 25,
});

/** Every day from `from` to `to`, both included. */
const range = (from: string, to: string, kwhExported = 2): LifetimeDay[] => {
  const days: LifetimeDay[] = [];
  for (
    let date = new Date(`${from}T00:00:00Z`);
    date <= new Date(`${to}T00:00:00Z`);
    date = new Date(date.getTime() + 86_400_000)
  ) {
    days.push(day(date.toISOString().slice(0, 10), kwhExported));
  }
  return days;
};

const feedIn = (pricePerKwh: number, effectiveFrom: string): Tariff => ({
  id: crypto.randomUUID(),
  kind: 'feedIn',
  pricePerKwh,
  effectiveFrom,
});

describe('billing periods', () => {
  it('should run from the anniversary to the eve of the next one', () => {
    expect(billingPeriodOf('2023-03-03', 2026)).toEqual({
      year: 2026,
      start: '2026-03-03',
      end: '2027-03-02',
      totalDays: 365,
    });
  });

  it('should move a 29 February start to the 28th in common years, without drifting', () => {
    expect(anniversaryIn('2024-02-29', 2025)).toBe('2025-02-28');
    expect(anniversaryIn('2024-02-29', 2027)).toBe('2027-02-28');
    expect(anniversaryIn('2024-02-29', 2028)).toBe('2028-02-29');
    expect(billingPeriodOf('2024-02-29', 2027)).toMatchObject({
      start: '2027-02-28',
      end: '2028-02-28',
      totalDays: 366,
    });
  });

  it('should find the current period around the anniversary', () => {
    expect(currentBillingYear('2023-03-03', '2026-03-02')).toBe(2025);
    expect(currentBillingYear('2023-03-03', '2026-03-03')).toBe(2026);
    expect(currentBillingYear('2023-03-03', '2023-03-03')).toBe(2023);
  });

  it('should say a contract that has not started has no current period', () => {
    expect(currentBillingYear('2027-03-03', '2026-11-12')).toBeNull();
  });

  it('should stop the history at the first period holding a stored day', () => {
    const days = range('2024-09-01', '2026-01-31');

    // 2024-09-01 is in the period that started on 2024-03-03.
    expect(oldestBillingYear('2023-03-03', days, 2025)).toBe(2024);
    // Stored days before the contract never reach back before its start.
    expect(oldestBillingYear('2025-03-03', days, 2025)).toBe(2025);
    // Nothing stored: only the current period.
    expect(oldestBillingYear('2023-03-03', [], 2025)).toBe(2025);
  });
});

describe('computePeriodResale, finished period', () => {
  const tariffs = [feedIn(0.13, '2024-01-01'), feedIn(0.1, '2025-07-01')];

  it('should give the final amount at the tariff of each day', () => {
    // 2024-03-03 to 2025-03-02: the 0.13 tariff only.
    const days = range('2024-03-03', '2025-03-02');

    const result = computePeriodResale(days, tariffs, '2023-03-03', 2024, '2026-11-12');

    expect(result.isCurrent).toBe(false);
    expect(result.acquired).toBeCloseTo(365 * 2 * 0.13, 6);
    expect(result.missingDays).toBe(0);
    expect(result.estimate).toBeNull();
    expect(result.remainingDays).toBe(0);
  });

  it('should keep valuing the past at the old price when a tariff changes later', () => {
    const days = range('2025-03-03', '2026-03-02');

    const result = computePeriodResale(days, tariffs, '2023-03-03', 2025, '2026-11-12');

    // 2025-03-03 to 2025-06-30 is 120 days at 0.13, then 245 days at 0.10.
    expect(result.acquired).toBeCloseTo(2 * (120 * 0.13 + 245 * 0.1), 6);
  });

  it('should not count a missing day as zero, and say how many there are', () => {
    // The history starts 10 days late: 10 days of the period are not stored.
    const days = range('2024-03-13', '2025-03-02');

    const result = computePeriodResale(days, tariffs, '2023-03-03', 2024, '2026-11-12');

    expect(result.missingDays).toBe(10);
    expect(result.acquired).toBeCloseTo(355 * 2 * 0.13, 6);
  });

  it('should leave days without a feed-in tariff unvalued', () => {
    const days = range('2024-03-03', '2025-03-02');

    const result = computePeriodResale(
      days,
      [feedIn(0.13, '2024-03-13')],
      '2023-03-03',
      2024,
      '2026-11-12',
    );

    expect(result.unpricedDays).toBe(10);
    expect(result.acquired).toBeCloseTo(355 * 2 * 0.13, 6);
  });
});

describe('computePeriodResale, current period', () => {
  const billingStart = '2023-03-03';

  it('should count the stored days up to yesterday and the days left from today', () => {
    // Period 2026-03-03 to 2027-03-02; today is 2026-06-01, the 90th day (index 90).
    const days = range('2026-03-03', '2026-05-31');

    const result = computePeriodResale(
      days,
      [feedIn(0.1, '2026-01-01')],
      billingStart,
      2026,
      '2026-06-01',
    );

    expect(result.isCurrent).toBe(true);
    expect(result.elapsedDays).toBe(90);
    expect(result.remainingDays).toBe(275);
    expect(result.acquired).toBeCloseTo(90 * 2 * 0.1, 6);
    expect(result.missingDays).toBe(0);
  });

  it('should project the days left on the same days of the previous period', () => {
    // Previous period: 1 kWh a day, except the days from 2025-06-01 on that give 3.
    const previous = [
      ...range('2025-03-03', '2025-05-31', 1),
      ...range('2025-06-01', '2026-03-02', 3),
    ];
    const current = range('2026-03-03', '2026-05-31', 5);
    const tariffs = [feedIn(0.1, '2025-01-01')];

    const result = computePeriodResale(
      [...previous, ...current],
      tariffs,
      billingStart,
      2026,
      '2026-06-01',
    );

    // Acquired: 90 days at 5 kWh. Projection: the 275 days left reuse the previous period's
    // days 90 to 364, all at 3 kWh.
    expect(result.estimate?.basis).toBe('previousPeriod');
    expect(result.estimate?.amount).toBeCloseTo((90 * 5 + 275 * 3) * 0.1, 6);
  });

  it('should fall back on the last year stored when the previous period is not whole', () => {
    // 100 days stored in the current period only.
    const days = range('2026-03-03', '2026-06-10', 4);

    const result = computePeriodResale(
      days,
      [feedIn(0.1, '2025-01-01')],
      billingStart,
      2026,
      '2026-06-11',
    );

    // Today is index 100: 100 days acquired, 265 projected at the 4 kWh average.
    expect(result.estimate?.basis).toBe('lastYear');
    expect(result.estimate?.amount).toBeCloseTo((100 * 4 + 265 * 4) * 0.1, 6);
  });

  it('should project a tariff dated in the future on the days it covers', () => {
    const days = range('2026-03-03', '2026-06-10', 4);
    const tariffs = [feedIn(0.1, '2025-01-01'), feedIn(0.2, '2026-09-01')];

    const result = computePeriodResale(days, tariffs, billingStart, 2026, '2026-06-11');

    // 2026-06-11 to 2026-08-31 is 82 days at 0.10, then 2026-09-01 to 2027-03-02 is 183 days at 0.20.
    expect(result.estimate?.amount).toBeCloseTo(100 * 4 * 0.1 + 4 * (82 * 0.1 + 183 * 0.2), 6);
  });

  it('should give no estimate with less than 30 days of history', () => {
    const days = range('2026-05-01', '2026-05-20');

    const result = computePeriodResale(
      days,
      [feedIn(0.1, '2025-01-01')],
      billingStart,
      2026,
      '2026-05-21',
    );

    expect(result.estimate).toBeNull();
    expect(result.acquired).toBeCloseTo(20 * 2 * 0.1, 6);
  });

  it('should report the days not stored since the period started', () => {
    // Stored from 2026-03-13: 10 days of the period are missing.
    const days = range('2026-03-13', '2026-05-31');

    const result = computePeriodResale(
      days,
      [feedIn(0.1, '2025-01-01')],
      billingStart,
      2026,
      '2026-06-01',
    );

    expect(result.missingDays).toBe(10);
  });
});
