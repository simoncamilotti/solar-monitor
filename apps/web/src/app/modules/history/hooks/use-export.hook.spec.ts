const { languageRef } = vi.hoisted(() => ({ languageRef: { current: 'fr' } }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: languageRef.current } }),
}));

import { renderHook } from '@testing-library/react';

import type { LifetimeDataResponseDto } from '@/shared-models';

import type { ExportConfig } from './use-export.hook';
import { useExport } from './use-export.hook';

const mockData: LifetimeDataResponseDto = [
  { date: '2023-03-15', kwhProduced: 10, kwhConsumed: 8, kwhImported: 2, kwhExported: 4, gridDependency: 20 },
  { date: '2024-01-10', kwhProduced: 12, kwhConsumed: 9, kwhImported: 1, kwhExported: 5, gridDependency: 15 },
  {
    date: '2024-06-20',
    kwhProduced: 15,
    kwhConsumed: 11,
    kwhImported: 3,
    kwhExported: 6,
    gridDependency: 25,
  },
];

let capturedBlob: Blob | undefined;
let clickSpy: ReturnType<typeof vi.spyOn>;

/**
 * Reads back what the hook handed to the browser as a download. jsdom's Blob has no `text()`, hence
 * the FileReader. The leading BOM is an Excel concern, not part of the payload under test.
 */
const exportedCsv = (): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!capturedBlob) return reject(new Error('no download was triggered'));

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^\uFEFF/, ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(capturedBlob);
  });

describe('useExport', () => {
  beforeEach(() => {
    languageRef.current = 'fr';
    capturedBlob = undefined;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock';
    });
    URL.revokeObjectURL = vi.fn();
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  });

  afterEach(() => {
    clickSpy.mockRestore();
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
      const config: ExportConfig = { year: 'all', month: 'all', metrics: ['kwhProduced'] };

      expect(result.current.getFilteredData(config)).toHaveLength(3);
    });

    it('should filter by year', () => {
      const { result } = renderHook(() => useExport(mockData));
      const config: ExportConfig = { year: '2024', month: 'all', metrics: ['kwhProduced'] };

      expect(result.current.getFilteredData(config)).toHaveLength(2);
    });

    it('should filter by month', () => {
      const { result } = renderHook(() => useExport(mockData));
      const config: ExportConfig = { year: 'all', month: '5', metrics: ['kwhProduced'] };

      const filtered = result.current.getFilteredData(config);
      expect(filtered).toHaveLength(1);
      expect(new Date(filtered[0].date).getMonth()).toBe(5);
    });

    it('should filter by year and month', () => {
      const { result } = renderHook(() => useExport(mockData));
      const config: ExportConfig = { year: '2024', month: '0', metrics: ['kwhProduced'] };

      expect(result.current.getFilteredData(config)).toHaveLength(1);
    });

    it('should return empty array when no data', () => {
      const { result } = renderHook(() => useExport(undefined));
      const config: ExportConfig = { year: 'all', month: 'all', metrics: ['kwhProduced'] };

      expect(result.current.getFilteredData(config)).toEqual([]);
    });
  });

  describe('exportData', () => {
    it('should trigger a csv download', () => {
      const { result } = renderHook(() => useExport(mockData));

      result.current.exportData({ year: 'all', month: 'all', metrics: ['kwhProduced'] });

      expect(clickSpy).toHaveBeenCalledOnce();
      expect(URL.createObjectURL).toHaveBeenCalledOnce();
      expect(capturedBlob?.type).toBe('text/csv;charset=utf-8');
    });

    it('should write a header row followed by one row per entry', async () => {
      const { result } = renderHook(() => useExport(mockData));

      result.current.exportData({ year: 'all', month: 'all', metrics: ['kwhProduced', 'kwhConsumed'] });

      expect(await exportedCsv()).toBe(
        [
          'Date;Production (kWh);Consommation (kWh)',
          '2023-03-15;10,00;8,00',
          '2024-01-10;12,00;9,00',
          '2024-06-20;15,00;11,00',
        ].join('\n'),
      );
    });

    it('should only write the requested metrics, in the requested order', async () => {
      const { result } = renderHook(() => useExport(mockData));

      result.current.exportData({ year: '2023', month: 'all', metrics: ['gridDependency', 'kwhExported'] });

      expect(await exportedCsv()).toBe(['Date;Dépendance (%);Export (kWh)', '2023-03-15;20,00;4,00'].join('\n'));
    });

    it('should use the anglo-saxon dialect in english', async () => {
      languageRef.current = 'en';
      const { result } = renderHook(() => useExport(mockData));

      result.current.exportData({ year: '2023', month: 'all', metrics: ['kwhProduced'] });

      expect(await exportedCsv()).toBe(['Date,Production (kWh)', '2023-03-15,10.00'].join('\n'));
    });

    it('should fall back to french for an unknown language', async () => {
      languageRef.current = 'de';
      const { result } = renderHook(() => useExport(mockData));

      result.current.exportData({ year: '2023', month: 'all', metrics: ['kwhProduced'] });

      expect(await exportedCsv()).toBe(['Date;Production (kWh)', '2023-03-15;10,00'].join('\n'));
    });

    it('should name the file after the export date', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-18T10:00:00Z'));

      const { result } = renderHook(() => useExport(mockData));
      // Spied after the render, which appends its own container to the body.
      const appendSpy = vi.spyOn(document.body, 'appendChild');
      result.current.exportData({ year: 'all', month: 'all', metrics: ['kwhProduced'] });

      const link = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
      expect(link.download).toBe('solar-data-2026-09-18.csv');

      appendSpy.mockRestore();
      vi.useRealTimers();
    });

    it('should not export when filtered data is empty', () => {
      const { result } = renderHook(() => useExport(mockData));

      result.current.exportData({ year: '1999', month: 'all', metrics: ['kwhProduced'] });

      expect(clickSpy).not.toHaveBeenCalled();
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });
  });
});
