import type { LifetimeDay } from '@repo/contracts';

import { computeRecords, isAutonomousDay } from './records.js';

const day = (date: string, overrides: Partial<LifetimeDay> = {}): LifetimeDay => ({
  date,
  kwhProduced: 10,
  kwhConsumed: 8,
  kwhImported: 0,
  kwhExported: 2,
  gridDependency: 0,
  ...overrides,
});

describe('computeRecords', () => {
  it('should return null for an empty history', () => {
    expect(computeRecords([])).toBeNull();
  });

  it('should find the best day and month of production', () => {
    const records = computeRecords([
      day('2024-05-01', { kwhProduced: 12 }),
      day('2024-05-02', { kwhProduced: 20 }),
      day('2024-06-01', { kwhProduced: 18 }),
      day('2024-06-02', { kwhProduced: 18 }),
    ]);

    expect(records?.bestDay).toEqual({ date: '2024-05-02', value: 20 });
    expect(records?.bestMonth).toEqual({ month: '2024-06', value: 36 });
  });

  it('should keep the earliest day and month on a tie, whatever the input order', () => {
    const records = computeRecords([
      day('2024-06-01', { kwhProduced: 20 }),
      day('2024-05-01', { kwhProduced: 20 }),
    ]);

    expect(records?.bestDay.date).toBe('2024-05-01');
    expect(records?.bestMonth.month).toBe('2024-05');
  });

  it('should total the production since the first day', () => {
    const records = computeRecords([day('2024-05-02'), day('2024-05-01', { kwhProduced: 5 })]);

    expect(records?.totalProduction).toEqual({ since: '2024-05-01', value: 15 });
  });

  it('should find the longest run of autonomous days', () => {
    const records = computeRecords([
      day('2024-05-01'),
      day('2024-05-02'),
      day('2024-05-03', { kwhImported: 1 }),
      day('2024-05-04'),
      day('2024-05-05'),
      day('2024-05-06'),
      day('2024-05-07', { kwhImported: 0.5 }),
    ]);

    expect(records?.longestStreak).toEqual({ from: '2024-05-04', to: '2024-05-06', days: 3 });
  });

  it('should break a run on a missing day', () => {
    const records = computeRecords([
      day('2024-05-01'),
      day('2024-05-02'),
      day('2024-05-04'),
      day('2024-05-05'),
      day('2024-05-06'),
    ]);

    expect(records?.longestStreak).toEqual({ from: '2024-05-04', to: '2024-05-06', days: 3 });
  });

  it('should keep the earliest run when two have the same length', () => {
    const records = computeRecords([
      day('2024-05-01'),
      day('2024-05-02', { kwhImported: 1 }),
      day('2024-05-03'),
    ]);

    expect(records?.longestStreak).toEqual({ from: '2024-05-01', to: '2024-05-01', days: 1 });
  });

  it('should run across a month boundary', () => {
    const records = computeRecords([day('2024-03-31'), day('2024-04-01')]);

    expect(records?.longestStreak).toEqual({ from: '2024-03-31', to: '2024-04-01', days: 2 });
  });

  it('should report the run that ends on the last stored day as the current one', () => {
    const records = computeRecords([
      day('2024-05-01'),
      day('2024-05-02'),
      day('2024-05-03'),
      day('2024-05-04', { kwhImported: 1 }),
      day('2024-05-05'),
    ]);

    expect(records?.currentStreak).toEqual({ from: '2024-05-05', to: '2024-05-05', days: 1 });
    expect(records?.longestStreak?.days).toBe(3);
  });

  it('should have no current run when the last day drew from the grid', () => {
    const records = computeRecords([day('2024-05-01'), day('2024-05-02', { kwhImported: 1 })]);

    expect(records?.currentStreak).toBeNull();
  });

  it('should have no run at all when every day drew from the grid', () => {
    const records = computeRecords([day('2024-05-01', { kwhImported: 1 })]);

    expect(records?.longestStreak).toBeNull();
    expect(records?.currentStreak).toBeNull();
  });

  it('should find the month with the highest autonomy', () => {
    const records = computeRecords([
      day('2024-05-01', { kwhConsumed: 10, kwhImported: 5 }),
      day('2024-06-01', { kwhConsumed: 10, kwhImported: 1 }),
      day('2024-07-01', { kwhConsumed: 10, kwhImported: 3 }),
    ]);

    expect(records?.mostAutonomousMonth).toEqual({ month: '2024-06', value: 90 });
  });

  it('should ignore months without consumption for autonomy', () => {
    const records = computeRecords([day('2024-05-01', { kwhConsumed: 0 })]);

    expect(records?.mostAutonomousMonth).toBeNull();
  });
});

describe('isAutonomousDay', () => {
  it('should be true only when nothing was imported', () => {
    expect(isAutonomousDay(day('2024-05-01'))).toBe(true);
    expect(isAutonomousDay(day('2024-05-01', { kwhImported: 0.001 }))).toBe(false);
  });
});
