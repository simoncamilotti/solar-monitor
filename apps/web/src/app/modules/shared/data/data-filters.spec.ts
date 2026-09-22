import type { LifetimeDataDto } from '@/shared-models';

import { filterByDay, filterByMonth, filterByYear } from './data-filters';

const entry = (date: string): LifetimeDataDto => ({
  date,
  kwhProduced: 1,
  kwhConsumed: 1,
  kwhImported: 1,
  kwhExported: 1,
  gridDependency: 0,
});

const DATA = [entry('2025-01-15'), entry('2025-06-30'), entry('2025-06-01'), entry('2026-06-15'), entry('2026-12-31')];

describe('filterByYear', () => {
  it('should return only entries matching the given year', () => {
    const result = filterByYear(DATA, 2025);

    expect(result).toHaveLength(3);
    expect(result.every(d => new Date(d.date).getFullYear() === 2025)).toBe(true);
  });

  it('should return an empty array when no entry matches', () => {
    expect(filterByYear(DATA, 1999)).toEqual([]);
  });
});

describe('filterByMonth', () => {
  it('should return only entries matching the given year and month (0-indexed)', () => {
    const result = filterByMonth(DATA, 2025, 5); // June

    expect(result).toHaveLength(2);
  });

  it('should not match the same month in a different year', () => {
    const result = filterByMonth(DATA, 2025, 11); // December 2025 doesn't exist in DATA

    expect(result).toEqual([]);
  });

  it('should return an empty array when no entry matches', () => {
    expect(filterByMonth(DATA, 2030, 0)).toEqual([]);
  });
});

describe('filterByDay', () => {
  it('should return only the entry matching the given day', () => {
    const result = filterByDay(DATA, '2026-06-15');

    expect(result).toHaveLength(1);
    expect(new Date(result[0].date).getDate()).toBe(15);
  });

  it('should pad single-digit month and day when building the comparison key', () => {
    const result = filterByDay(DATA, '2025-01-15');

    expect(result).toHaveLength(1);
  });

  it('should return an empty array when no entry matches the day', () => {
    expect(filterByDay(DATA, '2099-01-01')).toEqual([]);
  });
});
