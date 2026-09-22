vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { act, renderHook } from '@testing-library/react';

import type { LifetimeDataDto } from '@/shared-models';

import { useDashboardFilters } from './use-dashboard-filters.hook';

const STORAGE_KEY = 'dashboard-filters';

const entry = (date: string, overrides: Partial<LifetimeDataDto> = {}): LifetimeDataDto => ({
  date,
  kwhProduced: 1,
  kwhConsumed: 1,
  kwhImported: 1,
  kwhExported: 1,
  gridDependency: 0,
  ...overrides,
});

const DATA = [entry('2025-03-10'), entry('2025-11-20'), entry('2026-01-05'), entry('2026-06-15')];

describe('useDashboardFilters', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should default to the most recent year and its most recent month when nothing is stored', () => {
    const { result } = renderHook(() => useDashboardFilters(DATA));

    expect(result.current.filters.viewMode).toBe('yearly');
    expect(result.current.filters.selectedYear).toBe(2026);
    expect(result.current.filters.selectedMonth).toBe(5); // June, the latest month in 2026
    expect(result.current.filters.selectedMetric).toBe('kwhConsumed');
  });

  it('should default customStartDate/customEndDate to the first and last entries', () => {
    const { result } = renderHook(() => useDashboardFilters(DATA));

    expect(result.current.filters.customStartDate).toBe('2025-03-10');
    expect(result.current.filters.customEndDate).toBe('2026-06-15');
  });

  it('should fall back to the current year when there is no data at all', () => {
    const { result } = renderHook(() => useDashboardFilters([]));

    expect(result.current.filters.selectedYear).toBe(new Date().getFullYear());
    expect(result.current.filters.customStartDate).toBeNull();
    expect(result.current.filters.customEndDate).toBeNull();
  });

  it('should restore a valid state from localStorage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ viewMode: 'monthly', selectedYear: 2025, selectedMonth: 10, selectedMetric: 'kwhProduced' }),
    );

    const { result } = renderHook(() => useDashboardFilters(DATA));

    expect(result.current.filters.viewMode).toBe('monthly');
    expect(result.current.filters.selectedYear).toBe(2025);
    expect(result.current.filters.selectedMonth).toBe(10);
    expect(result.current.filters.selectedMetric).toBe('kwhProduced');
  });

  it('should ignore an invalid viewMode from localStorage and fall back to yearly', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ viewMode: 'not-a-real-mode' }));

    const { result } = renderHook(() => useDashboardFilters(DATA));

    expect(result.current.filters.viewMode).toBe('yearly');
  });

  it('should ignore an invalid selectedYear from localStorage and fall back to the latest year', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedYear: 1999 }));

    const { result } = renderHook(() => useDashboardFilters(DATA));

    expect(result.current.filters.selectedYear).toBe(2026);
  });

  it('should ignore an invalid selectedMonth from localStorage and fall back to the latest month', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedYear: 2025, selectedMonth: 11 }));

    const { result } = renderHook(() => useDashboardFilters(DATA));

    // December (11) has no data in 2025 — November (10) is the latest month with data
    expect(result.current.filters.selectedMonth).toBe(10);
  });

  it('should ignore an invalid selectedMetric from localStorage and fall back to kwhConsumed', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedMetric: 'notAMetric' }));

    const { result } = renderHook(() => useDashboardFilters(DATA));

    expect(result.current.filters.selectedMetric).toBe('kwhConsumed');
  });

  it('should ignore malformed JSON in localStorage rather than throw', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json');

    const { result } = renderHook(() => useDashboardFilters(DATA));

    expect(result.current.filters.viewMode).toBe('yearly');
  });

  it('should fall back to the first/last data date when the stored custom dates are not in the data', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ customStartDate: '1999-01-01' }));

    const { result } = renderHook(() => useDashboardFilters(DATA));

    expect(result.current.filters.customStartDate).toBe('2025-03-10');
  });

  it('should update the view mode', () => {
    const { result } = renderHook(() => useDashboardFilters(DATA));

    act(() => {
      result.current.setViewMode('custom');
    });

    expect(result.current.filters.viewMode).toBe('custom');
  });

  it('should update the custom date range', () => {
    const { result } = renderHook(() => useDashboardFilters(DATA));

    act(() => {
      result.current.setCustomRange('2026-01-01', '2026-01-31');
    });

    expect(result.current.filters.customStartDate).toBe('2026-01-01');
    expect(result.current.filters.customEndDate).toBe('2026-01-31');
  });

  it('should persist filter changes to localStorage', () => {
    const { result } = renderHook(() => useDashboardFilters(DATA));

    act(() => {
      result.current.setMetric('kwhImported');
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored.selectedMetric).toBe('kwhImported');
  });

  it('should reset the selected month to a valid one when changing year', () => {
    const { result } = renderHook(() => useDashboardFilters(DATA));

    act(() => {
      result.current.setYear(2025);
    });

    expect(result.current.filters.selectedYear).toBe(2025);
    expect(result.current.filters.selectedMonth).toBe(10); // latest month with data in 2025
  });

  it('should keep the selected month when it is still valid for the new year', () => {
    const data = [entry('2025-06-01'), entry('2026-06-01')];
    const { result } = renderHook(() => useDashboardFilters(data));

    act(() => {
      result.current.setYear(2025);
    });

    expect(result.current.filters.selectedMonth).toBe(5); // June exists in both years
  });

  it('should ignore setYear(null)', () => {
    const { result } = renderHook(() => useDashboardFilters(DATA));
    const before = result.current.filters.selectedYear;

    act(() => {
      result.current.setYear(null);
    });

    expect(result.current.filters.selectedYear).toBe(before);
  });

  it('should parse a yyyy-MM string in setMonth', () => {
    const { result } = renderHook(() => useDashboardFilters(DATA));

    act(() => {
      result.current.setMonth('2025-11');
    });

    expect(result.current.filters.selectedYear).toBe(2025);
    expect(result.current.filters.selectedMonth).toBe(10);
  });

  it('should ignore setMonth(null)', () => {
    const { result } = renderHook(() => useDashboardFilters(DATA));
    const before = result.current.filters;

    act(() => {
      result.current.setMonth(null);
    });

    expect(result.current.filters).toEqual(before);
  });

  it('should compute the min/max date range from the data', () => {
    const { result } = renderHook(() => useDashboardFilters(DATA));

    expect(result.current.dateRange.min).toBe('2025-03-10');
    expect(result.current.dateRange.max).toBe('2026-06-15');
  });

  it('should return a null date range for empty data', () => {
    const { result } = renderHook(() => useDashboardFilters([]));

    expect(result.current.dateRange).toEqual({ min: null, max: null });
  });
});
