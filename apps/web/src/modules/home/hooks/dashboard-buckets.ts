import { format, parseISO } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';

import type { LifetimeDay } from '@repo/contracts';

import { filterByRange } from '../../shared/data/data-filters.js';
import { aggregateEntries } from '../../shared/metrics/metric-computation.js';
import type { DashboardFilterState } from '../dashboard.type.js';

/** One bar of the dashboard chart: a year, a month or a day of the selected period. */
export type DashboardBucket = {
  /** Axis label. */
  label: string;
  /** Tooltip title, with the year or month the axis label leaves out. */
  title: string;
  entries: LifetimeDay[];
};

const groupBy = (entries: LifetimeDay[], keyOf: (d: LifetimeDay) => number) => {
  const groups = new Map<number, LifetimeDay[]>();
  for (const d of entries) {
    const key = keyOf(d);
    groups.set(key, [...(groups.get(key) ?? []), d]);
  }
  return [...groups.entries()].sort(([a], [b]) => a - b);
};

/** Buckets of the period: years since commissioning, months of a year, days otherwise. */
export const getDashboardBuckets = (
  data: LifetimeDay[],
  filters: DashboardFilterState,
  monthLabel: (month: number) => string,
): DashboardBucket[] => {
  switch (filters.viewMode) {
    case 'full':
      return groupBy(data, (d) => parseISO(d.date).getFullYear()).map(([year, entries]) => ({
        label: `${year}`,
        title: `${year}`,
        entries,
      }));

    case 'yearly': {
      const yearData = data.filter((d) => parseISO(d.date).getFullYear() === filters.selectedYear);
      return groupBy(yearData, (d) => parseISO(d.date).getMonth()).map(([month, entries]) => ({
        label: monthLabel(month),
        title: `${monthLabel(month)} ${filters.selectedYear}`,
        entries,
      }));
    }

    case 'monthly': {
      const monthData = data.filter((d) => {
        const date = parseISO(d.date);
        return (
          date.getFullYear() === filters.selectedYear && date.getMonth() === filters.selectedMonth
        );
      });
      return [...monthData]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d) => {
          const day = String(parseISO(d.date).getDate());
          return {
            label: day,
            title: `${day} ${monthLabel(filters.selectedMonth)} ${filters.selectedYear}`,
            entries: [d],
          };
        });
    }

    case 'custom': {
      const { customStartDate, customEndDate } = filters;
      if (!customStartDate || !customEndDate) {
        return [];
      }
      return filterByRange(data, customStartDate, customEndDate)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d) => {
          const label = format(parseISO(d.date), 'd MMM', { locale: frLocale });
          return { label, title: label, entries: [d] };
        });
    }
  }
};

export type KpiSparklines = {
  consumption: number[];
  production: number[];
  autonomy: number[];
  selfConsumption: number[];
};

const SPARKLINE_LENGTH = 12;

/** Last twelve buckets of the period, one series per KPI card. */
export const getKpiSparklines = (buckets: DashboardBucket[]): KpiSparklines => {
  const metrics = buckets.slice(-SPARKLINE_LENGTH).map((b) => aggregateEntries(b.entries));
  return {
    consumption: metrics.map((m) => m.consumed),
    production: metrics.map((m) => m.produced),
    autonomy: metrics.map((m) => m.autonomy),
    selfConsumption: metrics.map((m) => m.selfConsumption),
  };
};
