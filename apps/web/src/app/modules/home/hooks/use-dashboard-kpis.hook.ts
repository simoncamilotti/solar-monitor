import { differenceInCalendarDays, isAfter, isBefore, parse, parseISO, subDays, subMonths } from 'date-fns';
import { useMemo } from 'react';

import type { LifetimeDataDto, LifetimeDataResponseDto } from '@/shared-models';

import { filterByMonth, filterByYear } from '../../shared/data/data-filters';
import { aggregateEntries } from '../../shared/metrics/metric-computation';
import type { DashboardFilterState } from '../dashboard.type';

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

const filterCurrentPeriod = (data: LifetimeDataResponseDto, filters: DashboardFilterState): LifetimeDataDto[] => {
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

      const startDate = parse(customStartDate, 'yyyy-MM-dd', new Date());
      const endDate = parse(customEndDate, 'yyyy-MM-dd', new Date());
      return data.filter(d => isAfter(d.date, startDate) && isBefore(d.date, endDate));
    }
  }
};

const filterPreviousPeriod = (data: LifetimeDataResponseDto, filters: DashboardFilterState): LifetimeDataDto[] => {
  switch (filters.viewMode) {
    case 'full':
      return data;
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
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const rangeDays = differenceInCalendarDays(end, start) + 1;
      const prevEnd = subDays(start, 1);
      const prevStart = subDays(prevEnd, rangeDays - 1);
      const prevStartIso = `${prevStart.getFullYear()}-${String(prevStart.getMonth() + 1).padStart(2, '0')}-${String(prevStart.getDate()).padStart(2, '0')}`;
      const prevEndIso = `${prevEnd.getFullYear()}-${String(prevEnd.getMonth() + 1).padStart(2, '0')}-${String(prevEnd.getDate()).padStart(2, '0')}`;
      return data.filter(d => isAfter(d.date, parseISO(prevStartIso)) && isBefore(d.date, parseISO(prevEndIso)));
    }
  }
};

const computeDelta = (current: number, previous: number): number | null => {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

export const useDashboardKpis = (data: LifetimeDataResponseDto, filters: DashboardFilterState): DashboardKpis => {
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
      productionDelta: previousData.length > 0 ? computeDelta(current.produced, previous.produced) : null,
      consumptionDelta: previousData.length > 0 ? computeDelta(current.consumed, previous.consumed) : null,
      autonomyDelta: previousData.length > 0 ? current.autonomy - previous.autonomy : null,
      selfConsumptionDelta: previousData.length > 0 ? current.selfConsumption - previous.selfConsumption : null,
    };
  }, [data, filters]);
};
