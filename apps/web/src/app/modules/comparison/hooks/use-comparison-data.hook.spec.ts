vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { renderHook } from '@testing-library/react';

import type { LifetimeDataDto } from '@/shared-models';

import type { ComparisonFilterState } from '../comparison.type';
import { comparisonPeriodColors } from '../constants/comparison-colors';
import { useComparisonData } from './use-comparison-data.hook';

const entry = (date: string, kwhProduced: number): LifetimeDataDto => ({
  date,
  kwhProduced,
  kwhConsumed: 0,
  kwhImported: 0,
  kwhExported: 0,
  gridDependency: 0,
});

const baseFilters: ComparisonFilterState = {
  granularity: 'days',
  periods: [],
  metric: 'kwhProduced',
  resolution: 'daily',
  chartType: 'bar',
};

describe('useComparisonData', () => {
  it('should return an empty array when there are no periods', () => {
    const { result } = renderHook(() => useComparisonData([], baseFilters));

    expect(result.current).toEqual([]);
  });

  describe('day period', () => {
    it('should compute a single value for the requested day', () => {
      const data = [entry('2026-03-10', 10), entry('2026-03-11', 20)];
      const filters: ComparisonFilterState = { ...baseFilters, periods: [{ date: '2026-03-10' }] };

      const { result } = renderHook(() => useComparisonData(data, filters));

      expect(result.current).toHaveLength(1);
      expect(result.current[0].values).toEqual([10]);
      expect(result.current[0].categories).toEqual([result.current[0].label]);
    });
  });

  describe('month period', () => {
    it('should return one value per day of the month at daily resolution', () => {
      const data = [entry('2026-02-01', 5), entry('2026-02-15', 8)];
      const filters: ComparisonFilterState = {
        ...baseFilters,
        granularity: 'months',
        resolution: 'daily',
        periods: [{ year: 2026, month: 1 }], // February, non-leap: 28 days
      };

      const { result } = renderHook(() => useComparisonData(data, filters));

      expect(result.current[0].categories).toHaveLength(28);
      expect(result.current[0].values).toHaveLength(28);
      expect(result.current[0].values[0]).toBe(5);
      expect(result.current[0].values[14]).toBe(8);
      expect(result.current[0].values[1]).toBe(0); // no data for that day
    });

    it('should group entries by ISO week at weekly resolution', () => {
      // 2026-03-02 and 2026-03-03 fall in the same ISO week; 2026-03-10 is a different week.
      const data = [entry('2026-03-02', 1), entry('2026-03-03', 2), entry('2026-03-10', 4)];
      const filters: ComparisonFilterState = {
        ...baseFilters,
        granularity: 'months',
        resolution: 'weekly',
        periods: [{ year: 2026, month: 2 }], // March
      };

      const { result } = renderHook(() => useComparisonData(data, filters));

      expect(result.current[0].categories).toEqual(['S1', 'S2']);
      expect(result.current[0].values).toEqual([3, 4]);
    });

    it('should return empty series for an unsupported resolution', () => {
      const filters: ComparisonFilterState = {
        ...baseFilters,
        granularity: 'months',
        resolution: 'quarterly',
        periods: [{ year: 2026, month: 2 }],
      };

      const { result } = renderHook(() => useComparisonData([], filters));

      expect(result.current[0]).toMatchObject({ categories: [], values: [] });
    });
  });

  describe('year period', () => {
    it('should return 12 monthly totals', () => {
      const data = [entry('2026-01-05', 10), entry('2026-01-20', 5), entry('2026-06-01', 7)];
      const filters: ComparisonFilterState = {
        ...baseFilters,
        granularity: 'years',
        resolution: 'monthly',
        periods: [{ year: 2026 }],
      };

      const { result } = renderHook(() => useComparisonData(data, filters));

      expect(result.current[0].categories).toHaveLength(12);
      expect(result.current[0].values).toHaveLength(12);
      expect(result.current[0].values[0]).toBe(15); // January
      expect(result.current[0].values[5]).toBe(7); // June
      expect(result.current[0].values[1]).toBe(0); // February
    });

    it('should return 4 quarterly totals', () => {
      const data = [entry('2026-01-10', 10), entry('2026-02-10', 5), entry('2026-07-10', 8)];
      const filters: ComparisonFilterState = {
        ...baseFilters,
        granularity: 'years',
        resolution: 'quarterly',
        periods: [{ year: 2026 }],
      };

      const { result } = renderHook(() => useComparisonData(data, filters));

      expect(result.current[0].categories).toEqual(['T1', 'T2', 'T3', 'T4']);
      expect(result.current[0].values).toEqual([15, 0, 8, 0]);
    });

    it('should return 365 daily values for a non-leap year', () => {
      const filters: ComparisonFilterState = {
        ...baseFilters,
        granularity: 'years',
        resolution: 'daily',
        periods: [{ year: 2026 }],
      };

      const { result } = renderHook(() => useComparisonData([], filters));

      expect(result.current[0].categories).toHaveLength(365);
      expect(result.current[0].values).toHaveLength(365);
    });

    it('should return 366 daily values for a leap year', () => {
      const filters: ComparisonFilterState = {
        ...baseFilters,
        granularity: 'years',
        resolution: 'daily',
        periods: [{ year: 2028 }],
      };

      const { result } = renderHook(() => useComparisonData([], filters));

      expect(result.current[0].categories).toHaveLength(366);
      expect(result.current[0].values).toHaveLength(366);
    });

    it('should place each entry on its day-of-year at daily resolution', () => {
      const data = [entry('2026-01-01', 3), entry('2026-12-31', 9)];
      const filters: ComparisonFilterState = {
        ...baseFilters,
        granularity: 'years',
        resolution: 'daily',
        periods: [{ year: 2026 }],
      };

      const { result } = renderHook(() => useComparisonData(data, filters));

      expect(result.current[0].values[0]).toBe(3);
      expect(result.current[0].values[364]).toBe(9);
    });

    it('should return empty series for an unsupported resolution', () => {
      const filters: ComparisonFilterState = {
        ...baseFilters,
        granularity: 'years',
        resolution: 'weekly',
        periods: [{ year: 2026 }],
      };

      const { result } = renderHook(() => useComparisonData([], filters));

      expect(result.current[0]).toMatchObject({ categories: [], values: [] });
    });
  });

  describe('multiple periods', () => {
    it('should assign colors by cycling through the palette', () => {
      const periods = Array.from({ length: comparisonPeriodColors.length + 2 }, (_, i) => ({ year: 2000 + i }));
      const filters: ComparisonFilterState = {
        ...baseFilters,
        granularity: 'years',
        resolution: 'monthly',
        periods,
      };

      const { result } = renderHook(() => useComparisonData([], filters));

      expect(result.current[0].color).toBe(comparisonPeriodColors[0]);
      expect(result.current[comparisonPeriodColors.length].color).toBe(comparisonPeriodColors[0]);
      expect(result.current[comparisonPeriodColors.length + 1].color).toBe(comparisonPeriodColors[1]);
    });

    it('should label a year period, a month period and a day period distinctly', () => {
      const filters: ComparisonFilterState = {
        ...baseFilters,
        granularity: 'years',
        resolution: 'monthly',
        periods: [{ year: 2026 }, { year: 2026, month: 5 }, { date: '2026-06-15' }],
      };

      const { result } = renderHook(() => useComparisonData([], filters));

      expect(result.current[0].label).toBe('2026');
      expect(result.current[1].label).toBe('months.5 2026');
      expect(result.current[2].label).toBe('2026-06-15');
    });
  });
});
