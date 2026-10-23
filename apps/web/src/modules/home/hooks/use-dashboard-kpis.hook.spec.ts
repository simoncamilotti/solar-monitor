import { renderHook } from '@testing-library/react';

import type { LifetimeDay } from '@repo/contracts';

import type { DashboardFilterState } from '../dashboard.type.js';
import { useDashboardKpis } from './use-dashboard-kpis.hook.js';

const entry = (date: string, overrides: Partial<LifetimeDay> = {}): LifetimeDay => ({
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
  it('should report no delta in full mode, since the whole history has no previous period', () => {
    const data = [
      entry('2025-01-01', { kwhProduced: 10 }),
      entry('2026-01-01', { kwhProduced: 20 }),
    ];

    const { result } = renderHook(() =>
      useDashboardKpis(data, { ...baseFilters, viewMode: 'full' }),
    );

    expect(result.current.production).toBe(30);
    expect(result.current.productionDelta).toBeNull();
    expect(result.current.consumptionDelta).toBeNull();
    expect(result.current.autonomyDelta).toBeNull();
    expect(result.current.selfConsumptionDelta).toBeNull();
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
      useDashboardKpis(data, {
        ...baseFilters,
        viewMode: 'monthly',
        selectedYear: 2026,
        selectedMonth: 0,
      }),
    );

    expect(result.current.production).toBe(15);
    expect(result.current.productionDelta).toBeCloseTo(50, 5);
  });

  it('should include entries dated exactly on the custom range boundaries', () => {
    const data = [
      entry('2025-12-31'),
      entry('2026-01-01'),
      entry('2026-01-15'),
      entry('2026-01-31'),
      entry('2026-02-01'),
    ];

    const { result } = renderHook(() =>
      useDashboardKpis(data, {
        ...baseFilters,
        viewMode: 'custom',
        customStartDate: '2026-01-01',
        customEndDate: '2026-01-31',
      }),
    );

    expect(result.current.production).toBe(30);
  });

  it('should count a one-day custom range', () => {
    const data = [entry('2026-03-01', { kwhProduced: 12 }), entry('2026-03-02')];

    const { result } = renderHook(() =>
      useDashboardKpis(data, {
        ...baseFilters,
        viewMode: 'custom',
        customStartDate: '2026-03-01',
        customEndDate: '2026-03-01',
      }),
    );

    expect(result.current.production).toBe(12);
  });

  it('should compare a custom range against the previous range of the same length, bounds included', () => {
    const data = [
      entry('2026-01-21', { kwhProduced: 100 }), // outside both ranges
      entry('2026-01-22', { kwhProduced: 5 }), // first day of the previous range
      entry('2026-01-31', { kwhProduced: 5 }), // last day of the previous range
      entry('2026-02-01', { kwhProduced: 15 }),
      entry('2026-02-10', { kwhProduced: 15 }),
    ];

    const { result } = renderHook(() =>
      useDashboardKpis(data, {
        ...baseFilters,
        viewMode: 'custom',
        customStartDate: '2026-02-01',
        customEndDate: '2026-02-10',
      }),
    );

    expect(result.current.production).toBe(30);
    expect(result.current.productionDelta).toBeCloseTo(200, 5); // 30 against 10
  });

  it('should express rate deltas as a difference of points', () => {
    const data = [
      entry('2025-06-01', { kwhConsumed: 10, kwhImported: 5 }), // autonomy 50 %
      entry('2026-06-01', { kwhConsumed: 10, kwhImported: 2 }), // autonomy 80 %
    ];

    const { result } = renderHook(() =>
      useDashboardKpis(data, { ...baseFilters, viewMode: 'yearly', selectedYear: 2026 }),
    );

    expect(result.current.autonomyDelta).toBeCloseTo(30, 5);
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
