import { getISOWeek, parseISO } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDateLocale } from '../../../i18n/date-locale.js';
import { monthKey } from '../../../i18n/keys.js';

import type { LifetimeDay } from '@repo/contracts';

import { filterByDay, filterByMonth, filterByYear } from '../../shared/data/index.js';
import { getPeriodColor, useDisplayedTheme } from '../../shared/metrics/energy-colors.js';
import { computeMetric } from '../../shared/metrics/index.js';
import type {
  ComparisonFilterState,
  ComparisonPeriod,
  ComparisonResolution,
  ComparisonSeries,
} from '../comparison.type.js';
import { alignRanges } from '../comparison-ranges.js';
import { getPeriodLabel } from '../period-label.js';
import {
  isDayPeriod,
  isMonthPeriod,
  isRangePeriod,
  isYearPeriod,
} from './use-comparison-filters.hook.js';

const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

const RANGE_INDEX_KEYS = {
  daily: 'compare.ranges.dayIndex',
  weekly: 'compare.ranges.weekIndex',
  monthly: 'compare.ranges.monthIndex',
  quarterly: 'compare.ranges.monthIndex',
} as const satisfies Record<ComparisonResolution, string>;

export const useComparisonData = (
  data: LifetimeDay[],
  filters: ComparisonFilterState,
): ComparisonSeries[] => {
  const { t } = useTranslation();
  const theme = useDisplayedTheme();
  // Memoized so the `useMemo` below actually memoizes: an inline arrow here would be a fresh
  // reference on every render, which was defeating the memoization entirely.
  const monthName = useCallback((i: number) => t(monthKey(i)), [t]);
  const locale = useDateLocale();

  return useMemo(() => {
    if (filters.periods.length === 0) return [];

    if (filters.granularity === 'ranges') {
      const ranges = filters.periods.filter(isRangePeriod);
      const { length, values } = alignRanges(data, ranges, filters.metric, filters.resolution);
      const categories = Array.from({ length }, (_, i) =>
        t(RANGE_INDEX_KEYS[filters.resolution], { index: i + 1 }),
      );
      return ranges.map((period, index) => ({
        label: getPeriodLabel(period, monthName, locale),
        color: getPeriodColor(index, theme),
        categories,
        values: values[index] ?? [],
      }));
    }

    return filters.periods.map((period: ComparisonPeriod, index): ComparisonSeries => {
      const color = getPeriodColor(index, theme);
      const label = getPeriodLabel(period, monthName, locale);

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
              const dayEntries = entries.filter((e) => parseISO(e.date).getDate() === d + 1);
              return computeMetric(filters.metric, dayEntries);
            });
            return { label, color, categories, values };
          }

          case 'weekly': {
            const weekMap = new Map<number, LifetimeDay[]>();
            for (const e of entries) {
              const week = getISOWeek(parseISO(e.date));
              const arr = weekMap.get(week) ?? [];
              arr.push(e);
              weekMap.set(week, arr);
            }
            const sortedWeeks = [...weekMap.keys()].sort((a, b) => a - b);
            const categories = sortedWeeks.map((_, i) => `S${i + 1}`);
            const values = sortedWeeks.map((w) =>
              computeMetric(filters.metric, weekMap.get(w) ?? []),
            );
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
              const monthEntries = entries.filter((e) => parseISO(e.date).getMonth() === m);
              return computeMetric(filters.metric, monthEntries);
            });
            return { label, color, categories, values };
          }

          case 'quarterly': {
            const categories = ['T1', 'T2', 'T3', 'T4'];
            const values = Array.from({ length: 4 }, (_, q) => {
              const qEntries = entries.filter((e) => {
                const m = parseISO(e.date).getMonth();
                return Math.floor(m / 3) === q;
              });
              return computeMetric(filters.metric, qEntries);
            });
            return { label, color, categories, values };
          }

          case 'daily': {
            const isLeap =
              (period.year % 4 === 0 && period.year % 100 !== 0) || period.year % 400 === 0;
            const totalDays = isLeap ? 366 : 365;
            const categories = Array.from({ length: totalDays }, (_, i) => `${i + 1}`);
            const dayMap = new Map<number, LifetimeDay[]>();
            for (const e of entries) {
              const d = parseISO(e.date);
              const dayOfYear = Math.floor(
                (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000,
              );
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
  }, [data, filters, monthName, locale, t, theme]);
};
