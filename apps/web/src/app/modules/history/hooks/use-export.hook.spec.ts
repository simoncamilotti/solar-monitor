vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'fr' } }),
}));

const { mockWriteFile } = vi.hoisted(() => ({
  mockWriteFile: vi.fn(),
}));

vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn().mockReturnValue({}),
    book_new: vi.fn().mockReturnValue({}),
    book_append_sheet: vi.fn(),
  },
  writeFile: mockWriteFile,
}));

import { renderHook } from '@testing-library/react';

import type { LifetimeDataResponseDto } from '@/shared-models';

import type { ExportConfig } from './use-export.hook';
import { useExport } from './use-export.hook';

const mockData: LifetimeDataResponseDto = [
  { date: new Date('2023-03-15'), kwhProduced: 10, kwhConsumed: 8, kwhImported: 2, kwhExported: 4, gridDependency: 20 },
  { date: new Date('2024-01-10'), kwhProduced: 12, kwhConsumed: 9, kwhImported: 1, kwhExported: 5, gridDependency: 15 },
  {
    date: new Date('2024-06-20'),
    kwhProduced: 15,
    kwhConsumed: 11,
    kwhImported: 3,
    kwhExported: 6,
    gridDependency: 25,
  },
];

describe('useExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailableYears', () => {
    it('should return sorted unique years', () => {
      const { result } = renderHook(() => useExport(mockData));

      expect(result.current.getAvailableYears()).toEqual(['2023', '2024']);
    });

    it('should return empty array when no data', () => {
      const { result } = renderHook(() => useExport(undefined));

      expect(result.current.getAvailableYears()).toEqual([]);
    });
  });

  describe('getFilteredData', () => {
    it('should return all data when no filters applied', () => {
      const { result } = renderHook(() => useExport(mockData));
      const config: ExportConfig = { format: 'csv', year: 'all', month: 'all', metrics: ['kwhProduced'] };

      expect(result.current.getFilteredData(config)).toHaveLength(3);
    });

    it('should filter by year', () => {
      const { result } = renderHook(() => useExport(mockData));
      const config: ExportConfig = { format: 'csv', year: '2024', month: 'all', metrics: ['kwhProduced'] };

      expect(result.current.getFilteredData(config)).toHaveLength(2);
    });

    it('should filter by month', () => {
      const { result } = renderHook(() => useExport(mockData));
      const config: ExportConfig = { format: 'csv', year: 'all', month: '5', metrics: ['kwhProduced'] };

      const filtered = result.current.getFilteredData(config);
      expect(filtered).toHaveLength(1);
      expect(new Date(filtered[0].date).getMonth()).toBe(5);
    });

    it('should filter by year and month', () => {
      const { result } = renderHook(() => useExport(mockData));
      const config: ExportConfig = { format: 'csv', year: '2024', month: '0', metrics: ['kwhProduced'] };

      expect(result.current.getFilteredData(config)).toHaveLength(1);
    });

    it('should return empty array when no data', () => {
      const { result } = renderHook(() => useExport(undefined));
      const config: ExportConfig = { format: 'csv', year: 'all', month: 'all', metrics: ['kwhProduced'] };

      expect(result.current.getFilteredData(config)).toEqual([]);
    });
  });

  describe('exportData', () => {
    it('should export as CSV', () => {
      const { result } = renderHook(() => useExport(mockData));
      const config: ExportConfig = {
        format: 'csv',
        year: 'all',
        month: 'all',
        metrics: ['kwhProduced', 'kwhConsumed'],
      };

      result.current.exportData(config);

      expect(mockWriteFile).toHaveBeenCalledOnce();
      expect(mockWriteFile.mock.calls[0][1]).toMatch(/\.csv$/);
      expect(mockWriteFile.mock.calls[0][2]).toEqual({ bookType: 'csv' });
    });

    it('should export as Excel', () => {
      const { result } = renderHook(() => useExport(mockData));
      const config: ExportConfig = {
        format: 'excel',
        year: 'all',
        month: 'all',
        metrics: ['kwhProduced'],
      };

      result.current.exportData(config);

      expect(mockWriteFile).toHaveBeenCalledOnce();
      expect(mockWriteFile.mock.calls[0][1]).toMatch(/\.xlsx$/);
      expect(mockWriteFile.mock.calls[0][2]).toEqual({ bookType: 'xlsx' });
    });

    it('should not export when filtered data is empty', () => {
      const { result } = renderHook(() => useExport(mockData));
      const config: ExportConfig = {
        format: 'csv',
        year: '1999',
        month: 'all',
        metrics: ['kwhProduced'],
      };

      result.current.exportData(config);

      expect(mockWriteFile).not.toHaveBeenCalled();
    });
  });
});
