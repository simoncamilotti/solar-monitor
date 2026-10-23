import { act, renderHook } from '@testing-library/react';

import { useComparisonFilters } from './use-comparison-filters.hook.js';

describe('useComparisonFilters, ranges', () => {
  beforeEach(() => localStorage.clear());

  it('should fall back to the daily grouping when a range is shorter than two months', () => {
    const { result } = renderHook(() => useComparisonFilters([]));

    act(() => result.current.setGranularity('ranges'));
    act(() => result.current.addPeriod({ start: '2025-01-01', end: '2025-06-30' }));
    expect(result.current.availableResolutions).toContain('monthly');

    act(() => result.current.setResolution('monthly'));
    act(() => result.current.addPeriod({ start: '2025-08-01', end: '2025-08-14' }));

    expect(result.current.availableResolutions).not.toContain('monthly');
    expect(result.current.filters.resolution).toBe('daily');
  });

  it('should not add the same range twice, nor more than four periods', () => {
    const { result } = renderHook(() => useComparisonFilters([]));

    act(() => result.current.setGranularity('ranges'));
    act(() => result.current.addPeriod({ start: '2025-08-01', end: '2025-08-14' }));
    act(() => result.current.addPeriod({ start: '2025-08-01', end: '2025-08-14', name: 'Bis' }));
    expect(result.current.filters.periods).toHaveLength(1);

    for (const year of [2024, 2023, 2022, 2021]) {
      act(() => result.current.addPeriod({ start: `${year}-08-01`, end: `${year}-08-14` }));
    }
    expect(result.current.filters.periods).toHaveLength(4);
  });

  it('should keep the ranges for the next visit', () => {
    const first = renderHook(() => useComparisonFilters([]));
    act(() => first.result.current.setGranularity('ranges'));
    act(() =>
      first.result.current.addPeriod({ start: '2025-08-01', end: '2025-08-14', name: 'Été' }),
    );
    first.unmount();

    const { result } = renderHook(() => useComparisonFilters([]));

    expect(result.current.filters.granularity).toBe('ranges');
    expect(result.current.filters.periods).toEqual([
      { start: '2025-08-01', end: '2025-08-14', name: 'Été' },
    ]);
  });
});
