import type { LifetimeDataDto } from '@/shared-models';

import { getMonthsForYear } from './get-months-for-year';

const entry = (date: string): LifetimeDataDto => ({
  date,
  kwhProduced: 1,
  kwhConsumed: 1,
  kwhImported: 1,
  kwhExported: 1,
  gridDependency: 0,
});

describe('getMonthsForYear', () => {
  it('should return the distinct months present for the given year', () => {
    const data = [entry('2026-01-05'), entry('2026-01-20'), entry('2026-03-10'), entry('2026-06-01')];

    expect(getMonthsForYear(data, 2026)).toEqual([0, 2, 5]);
  });

  it('should ignore entries from other years', () => {
    const data = [entry('2025-11-01'), entry('2026-02-01')];

    expect(getMonthsForYear(data, 2026)).toEqual([1]);
  });

  it('should return an empty array when the year has no data', () => {
    expect(getMonthsForYear([entry('2026-01-01')], 1999)).toEqual([]);
  });

  it('should return an empty array for empty input', () => {
    expect(getMonthsForYear([], 2026)).toEqual([]);
  });
});
