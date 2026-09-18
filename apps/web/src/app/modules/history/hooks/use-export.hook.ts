import { format } from 'date-fns';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { LifetimeDataResponseDto } from '@/shared-models';

import type { EnergyMetricKey } from '../../shared/metrics/metric.type';

export type ExportMetric = EnergyMetricKey | 'gridDependency';

export type ExportConfig = {
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

/**
 * French spreadsheets read `;` as the column separator and `,` as the decimal mark. Emitting the
 * anglo-saxon pair to a French Excel lands every row in a single column, so the two travel together.
 */
const CSV_DIALECTS: Record<string, { separator: string; decimal: string }> = {
  fr: { separator: ';', decimal: ',' },
  en: { separator: ',', decimal: '.' },
};

const escapeCell = (value: string, separator: string): string =>
  value.includes(separator) || /["\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const downloadCsv = (content: string, filename: string): void => {
  // The BOM is what makes Excel read the file as UTF-8 rather than as the system code page.
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

  const buildCsv = useCallback(
    (filteredData: LifetimeDataResponseDto, metrics: ExportMetric[]) => {
      const locale = i18n.language in METRIC_HEADERS ? i18n.language : 'fr';
      const headers = METRIC_HEADERS[locale];
      const { separator, decimal } = CSV_DIALECTS[locale];

      const headerLine = ['Date', ...metrics.map(metric => headers[metric])]
        .map(cell => escapeCell(cell, separator))
        .join(separator);

      const lines = filteredData.map(row =>
        [
          format(new Date(row.date), 'yyyy-MM-dd'),
          ...metrics.map(metric => row[metric].toFixed(2).replace('.', decimal)),
        ]
          .map(cell => escapeCell(cell, separator))
          .join(separator),
      );

      return [headerLine, ...lines].join('\n');
    },
    [i18n.language],
  );

  const exportData = useCallback(
    (config: ExportConfig) => {
      const filteredData = getFilteredData(config);

      if (filteredData.length === 0) return;

      const timestamp = format(new Date(), 'yyyy-MM-dd');
      downloadCsv(buildCsv(filteredData, config.metrics), `solar-data-${timestamp}.csv`);
    },
    [getFilteredData, buildCsv],
  );

  const getAvailableYears = useCallback((): string[] => {
    if (!data) return [];
    const years = new Set(data.map(row => String(new Date(row.date).getFullYear())));
    return Array.from(years).sort();
  }, [data]);

  return { exportData, getFilteredData, getAvailableYears };
};
