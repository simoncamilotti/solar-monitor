import { getISOWeek } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { LifetimeDataDto, LifetimeDataResponseDto } from '@/shared-models';

import { filterByDay, filterByMonth, filterByYear } from '../../shared/data';
import { computeMetric } from '../../shared/metrics';
import type { ComparisonFilterState, ComparisonPeriod, ComparisonSeries } from '../comparison.type';
import { comparisonPeriodColors } from '../constants/comparison-colors';
import { isDayPeriod, isMonthPeriod, isYearPeriod } from './use-comparison-filters.hook';

const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

const getPeriodLabel = (period: ComparisonPeriod, monthNames: (i: number) => string): string => {
  if (isYearPeriod(period)) {
    return `${period.year}`;
  }
  if (isMonthPeriod(period)) {
    return `${monthNames(period.month)} ${period.year}`;
  }
  return period.date;
};

export const useComparisonData = (
  data: LifetimeDataResponseDto,
  filters: ComparisonFilterState,
): ComparisonSeries[] => {
  const { t } = useTranslation('web');
  const monthName = (i: number) => t(`months.${i}`);

  return useMemo(() => {
    if (filters.periods.length === 0) return [];

    return filters.periods.map((period: ComparisonPeriod, index): ComparisonSeries => {
      const color = comparisonPeriodColors[index % comparisonPeriodColors.length];
      const label = getPeriodLabel(period, monthName);

      if (isDayPeriod(period)) {
        const entries = filterByDay(data, period.date);
        return {
          label,
          color,
          categories: [label],
          values: [computeMetric(filters.metric, entries)],
        };
      }

      if (isMonthPeriod(period)) {
        const entries = filterByMonth(data, period.year, period.month);
        const totalDays = daysInMonth(period.year, period.month);

        switch (filters.resolution) {
          case 'daily': {
            const categories = Array.from({ length: totalDays }, (_, i) => `${i + 1}`);
            const values = Array.from({ length: totalDays }, (_, d) => {
              const dayEntries = entries.filter(e => new Date(e.date).getDate() === d + 1);
              return computeMetric(filters.metric, dayEntries);
            });
            return { label, color, categories, values };
          }

          case 'weekly': {
            const weekMap = new Map<number, LifetimeDataDto[]>();
            for (const e of entries) {
              const week = getISOWeek(new Date(e.date));
              const arr = weekMap.get(week) ?? [];
              arr.push(e);
              weekMap.set(week, arr);
            }
            const sortedWeeks = [...weekMap.keys()].sort((a, b) => a - b);
            const categories = sortedWeeks.map((_, i) => `S${i + 1}`);
            const values = sortedWeeks.map(w => computeMetric(filters.metric, weekMap.get(w) ?? []));
            return { label, color, categories, values };
          }

          default:
            return { label, color, categories: [], values: [] };
        }
      }

      if (isYearPeriod(period)) {
        const entries = filterByYear(data, period.year);

        switch (filters.resolution) {
          case 'monthly': {
            const categories = Array.from({ length: 12 }, (_, i) => monthName(i));
            const values = Array.from({ length: 12 }, (_, m) => {
              const monthEntries = entries.filter(e => new Date(e.date).getMonth() === m);
              return computeMetric(filters.metric, monthEntries);
            });
            return { label, color, categories, values };
          }

          case 'quarterly': {
            const categories = ['T1', 'T2', 'T3', 'T4'];
            const values = Array.from({ length: 4 }, (_, q) => {
              const qEntries = entries.filter(e => {
                const m = new Date(e.date).getMonth();
                return Math.floor(m / 3) === q;
              });
              return computeMetric(filters.metric, qEntries);
            });
            return { label, color, categories, values };
          }

          case 'daily': {
            const isLeap = (period.year % 4 === 0 && period.year % 100 !== 0) || period.year % 400 === 0;
            const totalDays = isLeap ? 366 : 365;
            const categories = Array.from({ length: totalDays }, (_, i) => `${i + 1}`);
            const dayMap = new Map<number, LifetimeDataDto[]>();
            for (const e of entries) {
              const d = new Date(e.date);
              const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
              const arr = dayMap.get(dayOfYear) ?? [];
              arr.push(e);
              dayMap.set(dayOfYear, arr);
            }
            const values = Array.from({ length: totalDays }, (_, i) =>
              computeMetric(filters.metric, dayMap.get(i + 1) ?? []),
            );
            return { label, color, categories, values };
          }

          default:
            return { label, color, categories: [], values: [] };
        }
      }

      return { label, color, categories: [], values: [] };
    });
  }, [data, filters, monthName]);
};
