vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr' },
  }),
}));

vi.mock('../../ui/constants/ag-grid-default-options', () => ({
  DEFAULT_GRID_OPTIONS: {},
}));

import { renderHook } from '@testing-library/react';

import { useHistoryGrid } from './use-history-grid.hook';

describe('useHistoryGrid', () => {
  it('should return column definitions', () => {
    const { result } = renderHook(() => useHistoryGrid());

    expect(result.current.columnDefs).toBeDefined();
    expect(result.current.columnDefs.length).toBe(9);
  });

  it('should have date column as first', () => {
    const { result } = renderHook(() => useHistoryGrid());

    expect(result.current.columnDefs[0].field).toBe('date');
    expect(result.current.columnDefs[0].headerName).toBe('history.columns.date');
  });

  it('should have numeric columns for metrics', () => {
    const { result } = renderHook(() => useHistoryGrid());

    const metricColumns = result.current.columnDefs.slice(4);
    expect(metricColumns).toHaveLength(5);
    metricColumns.forEach(col => {
      expect(col.type).toBe('solarNumericColumn');
    });
  });

  it('should return grid options', () => {
    const { result } = renderHook(() => useHistoryGrid());

    expect(result.current.gridOptions).toBeDefined();
    expect(result.current.gridOptions.defaultColDef).toBeDefined();
  });

  it('should return onGridReady callback', () => {
    const { result } = renderHook(() => useHistoryGrid());

    expect(typeof result.current.onGridReady).toBe('function');
  });

  it('should have expected metric fields', () => {
    const { result } = renderHook(() => useHistoryGrid());

    const fields = result.current.columnDefs.map(c => c.field).filter(Boolean);
    expect(fields).toContain('kwhProduced');
    expect(fields).toContain('kwhConsumed');
    expect(fields).toContain('kwhImported');
    expect(fields).toContain('kwhExported');
    expect(fields).toContain('gridDependency');
  });
});
