import { differenceInCalendarDays, format, parseISO, subDays, subMonths } from 'date-fns';
import { useMemo } from 'react';

import type { LifetimeDay } from '@repo/contracts';

import { filterByMonth, filterByRange, filterByYear } from '../../shared/data/data-filters.js';
import { aggregateEntries } from '../../shared/metrics/metric-computation.js';
import type { DashboardFilterState } from '../dashboard.type.js';

export type DashboardKpis = {
  production: number;
  consumption: number;
  autonomy: number;
  selfConsumption: number;
  productionDelta: number | null;
  consumptionDelta: number | null;
  autonomyDelta: number | null;
  selfConsumptionDelta: number | null;
};

const filterCurrentPeriod = (data: LifetimeDay[], filters: DashboardFilterState): LifetimeDay[] => {
  switch (filters.viewMode) {
    case 'full':
      return data;
    case 'yearly':
      return filterByYear(data, filters.selectedYear);
    case 'monthly':
      return filterByMonth(data, filters.selectedYear, filters.selectedMonth);
    case 'custom': {
      const { customStartDate, customEndDate } = filters;
      if (!customStartDate || !customEndDate) {
        return [];
      }
      return filterByRange(data, customStartDate, customEndDate);
    }
  }
};

const filterPreviousPeriod = (
  data: LifetimeDay[],
  filters: DashboardFilterState,
): LifetimeDay[] => {
  switch (filters.viewMode) {
    // The whole history has no period before it.
    case 'full':
      return [];
    case 'yearly':
      return filterByYear(data, filters.selectedYear - 1);
    case 'monthly': {
      const prev = subMonths(new Date(filters.selectedYear, filters.selectedMonth, 1), 1);
      return filterByMonth(data, prev.getFullYear(), prev.getMonth());
    }
    case 'custom': {
      const { customStartDate, customEndDate } = filters;
      if (!customStartDate || !customEndDate) {
        return [];
      }
      const start = parseISO(customStartDate);
      const end = parseISO(customEndDate);
      const rangeDays = differenceInCalendarDays(end, start) + 1;
      const prevEnd = subDays(start, 1);
      const prevStart = subDays(prevEnd, rangeDays - 1);
      return filterByRange(data, format(prevStart, 'yyyy-MM-dd'), format(prevEnd, 'yyyy-MM-dd'));
    }
  }
};

const computeDelta = (current: number, previous: number): number | null => {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

export const useDashboardKpis = (
  data: LifetimeDay[],
  filters: DashboardFilterState,
): DashboardKpis => {
  return useMemo(() => {
    const currentData = filterCurrentPeriod(data, filters);
    const previousData = filterPreviousPeriod(data, filters);

    const current = aggregateEntries(currentData);
    const previous = aggregateEntries(previousData);

    return {
      production: current.produced,
      consumption: current.consumed,
      autonomy: current.autonomy,
      selfConsumption: current.selfConsumption,
      productionDelta:
        previousData.length > 0 ? computeDelta(current.produced, previous.produced) : null,
      consumptionDelta:
        previousData.length > 0 ? computeDelta(current.consumed, previous.consumed) : null,
      autonomyDelta: previousData.length > 0 ? current.autonomy - previous.autonomy : null,
      selfConsumptionDelta:
        previousData.length > 0 ? current.selfConsumption - previous.selfConsumption : null,
    };
  }, [data, filters]);
};
