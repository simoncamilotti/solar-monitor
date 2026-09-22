import { renderHook } from '@testing-library/react';

import type { LifetimeDataDto } from '@/shared-models';

import type { DashboardFilterState } from '../dashboard.type';
import { useDashboardKpis } from './use-dashboard-kpis.hook';

const entry = (date: string, overrides: Partial<LifetimeDataDto> = {}): LifetimeDataDto => ({
  date,
  kwhProduced: 10,
  kwhConsumed: 8,
  kwhImported: 2,
  kwhExported: 4,
  gridDependency: 0,
  ...overrides,
});

const baseFilters: DashboardFilterState = {
  viewMode: 'full',
  selectedYear: 2026,
  selectedMonth: 0,
  selectedMetric: 'kwhProduced',
  customStartDate: null,
  customEndDate: null,
};

describe('useDashboardKpis', () => {
  it('should report zero deltas in full mode, since current and previous periods are the same data', () => {
    const data = [entry('2025-01-01', { kwhProduced: 10 }), entry('2026-01-01', { kwhProduced: 20 })];

    const { result } = renderHook(() => useDashboardKpis(data, { ...baseFilters, viewMode: 'full' }));

    expect(result.current.production).toBe(30);
    expect(result.current.productionDelta).toBe(0);
  });

  it('should compare a year against the previous year', () => {
    const data = [
      entry('2025-06-01', { kwhProduced: 10, kwhConsumed: 10, kwhImported: 5, kwhExported: 0 }),
      entry('2026-06-01', { kwhProduced: 20, kwhConsumed: 10, kwhImported: 2, kwhExported: 0 }),
    ];

    const { result } = renderHook(() =>
      useDashboardKpis(data, { ...baseFilters, viewMode: 'yearly', selectedYear: 2026 }),
    );

    expect(result.current.production).toBe(20);
    expect(result.current.productionDelta).toBe(100); // doubled year over year
  });

  it('should report null deltas when the previous year has no data', () => {
    const data = [entry('2026-06-01')];

    const { result } = renderHook(() =>
      useDashboardKpis(data, { ...baseFilters, viewMode: 'yearly', selectedYear: 2026 }),
    );

    expect(result.current.productionDelta).toBeNull();
    expect(result.current.consumptionDelta).toBeNull();
    expect(result.current.autonomyDelta).toBeNull();
    expect(result.current.selfConsumptionDelta).toBeNull();
  });

  it('should report a null delta when the previous period exists but its total is zero', () => {
    const data = [
      entry('2025-06-01', { kwhProduced: 0, kwhConsumed: 5, kwhImported: 5, kwhExported: 0 }),
      entry('2026-06-01', { kwhProduced: 10, kwhConsumed: 8, kwhImported: 2, kwhExported: 0 }),
    ];

    const { result } = renderHook(() =>
      useDashboardKpis(data, { ...baseFilters, viewMode: 'yearly', selectedYear: 2026 }),
    );

    expect(result.current.productionDelta).toBeNull();
  });

  it('should compare a month against the previous month, including a year rollover', () => {
    const data = [
      entry('2025-12-15', { kwhProduced: 10 }), // previous month for January 2026
      entry('2026-01-15', { kwhProduced: 15 }),
    ];

    const { result } = renderHook(() =>
      useDashboardKpis(data, { ...baseFilters, viewMode: 'monthly', selectedYear: 2026, selectedMonth: 0 }),
    );

    expect(result.current.production).toBe(15);
    expect(result.current.productionDelta).toBeCloseTo(50, 5);
  });

  // The comparison window is exclusive on both ends (`isAfter`/`isBefore`): an entry dated exactly
  // on the boundary is not counted.
  it('should exclude entries dated exactly on the custom range boundaries', () => {
    const data = [
      entry('2026-01-01T00:00:00.000Z'),
      entry('2026-01-15T00:00:00.000Z'),
      entry('2026-01-31T00:00:00.000Z'),
    ];

    const { result } = renderHook(() =>
      useDashboardKpis(data, {
        ...baseFilters,
        viewMode: 'custom',
        customStartDate: '2026-01-01',
        customEndDate: '2026-01-31',
      }),
    );

    // Only the entry strictly between the two boundaries survives the filter.
    expect(result.current.production).toBe(10);
  });

  it('should return an empty current period when the custom range is incomplete', () => {
    const data = [entry('2026-01-15')];

    const { result } = renderHook(() =>
      useDashboardKpis(data, {
        ...baseFilters,
        viewMode: 'custom',
        customStartDate: '2026-01-01',
        customEndDate: null,
      }),
    );

    expect(result.current.production).toBe(0);
    expect(result.current.productionDelta).toBeNull();
  });
});
