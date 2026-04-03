import { format } from 'date-fns';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

import type { LifetimeDataResponseDto } from '@/shared-models';

export type ExportFormat = 'csv' | 'excel';

import type { EnergyMetricKey } from '../../shared/metrics/metric.type';

export type ExportMetric = EnergyMetricKey | 'gridDependency';

export type ExportConfig = {
  format: ExportFormat;
  year: string;
  month: string;
  metrics: ExportMetric[];
};

const METRIC_HEADERS: Record<string, Record<ExportMetric, string>> = {
  fr: {
    kwhProduced: 'Production (Wh)',
    kwhConsumed: 'Consommation (Wh)',
    kwhImported: 'Import (Wh)',
    kwhExported: 'Export (Wh)',
    gridDependency: 'Dépendance (%)',
  },
  en: {
    kwhProduced: 'Production (Wh)',
    kwhConsumed: 'Consumption (Wh)',
    kwhImported: 'Import (Wh)',
    kwhExported: 'Export (Wh)',
    gridDependency: 'Dependency (%)',
  },
};

export const useExport = (data: LifetimeDataResponseDto | undefined) => {
  const { i18n } = useTranslation();

  const getFilteredData = useCallback(
    (config: ExportConfig) => {
      if (!data) return [];

      return data.filter(row => {
        const date = new Date(row.date);
        if (config.year !== 'all' && String(date.getFullYear()) !== config.year) return false;
        return !(config.month !== 'all' && String(date.getMonth()) !== config.month);
      });
    },
    [data],
  );

  const buildRows = useCallback(
    (filteredData: LifetimeDataResponseDto, metrics: ExportMetric[]) => {
      const headers = METRIC_HEADERS[i18n.language] ?? METRIC_HEADERS['fr'];

      return filteredData.map(row => {
        const entry: Record<string, string | number> = {
          Date: format(new Date(row.date), 'yyyy-MM-dd'),
        };
        for (const metric of metrics) {
          entry[headers[metric]] =
            metric === 'gridDependency' ? Number(row[metric].toFixed(2)) : Number(row[metric].toFixed(2));
        }
        return entry;
      });
    },
    [i18n.language],
  );

  const exportData = useCallback(
    (config: ExportConfig) => {
      const filteredData = getFilteredData(config);
      const rows = buildRows(filteredData, config.metrics);

      if (rows.length === 0) return;

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

      const timestamp = format(new Date(), 'yyyy-MM-dd');
      const filename = `solar-data-${timestamp}`;

      if (config.format === 'csv') {
        XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' });
      } else {
        XLSX.writeFile(workbook, `${filename}.xlsx`, { bookType: 'xlsx' });
      }
    },
    [getFilteredData, buildRows],
  );

  const getAvailableYears = useCallback((): string[] => {
    if (!data) return [];
    const years = new Set(data.map(row => String(new Date(row.date).getFullYear())));
    return Array.from(years).sort();
  }, [data]);

  return { exportData, getFilteredData, getAvailableYears };
};
