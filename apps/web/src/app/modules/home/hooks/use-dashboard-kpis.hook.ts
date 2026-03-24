import { subDays, subMonths } from 'date-fns';
import { useMemo } from 'react';

import type { LifetimeDataDto, LifetimeDataResponseDto } from '@/shared-models';

import type { DashboardFilterState, WeekRange } from '../dashboard.type';

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

const aggregate = (entries: LifetimeDataDto[]) => {
  const produced = entries.reduce((s, e) => s + e.kwhProduced, 0);
  const consumed = entries.reduce((s, e) => s + e.kwhConsumed, 0);
  const imported = entries.reduce((s, e) => s + e.kwhImported, 0);
  const exported = entries.reduce((s, e) => s + e.kwhExported, 0);

  const autonomy = consumed > 0 ? (1 - imported / consumed) * 100 : 0;
  const selfConsumption = produced > 0 ? ((produced - exported) / produced) * 100 : 0;

  return { produced, consumed, autonomy, selfConsumption };
};

const filterByYear = (data: LifetimeDataResponseDto, year: number) => {
  return data.filter(d => new Date(d.date).getFullYear() === year);
};

const filterByMonth = (data: LifetimeDataResponseDto, year: number, month: number) => {
  return data.filter(d => {
    const date = new Date(d.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
};

const filterByWeek = (data: LifetimeDataResponseDto, week: WeekRange) => {
  return data.filter(d => {
    const date = new Date(d.date);
    return date >= week.start && date <= week.end;
  });
};

const filterByDay = (data: LifetimeDataResponseDto, day: string) => {
  return data.filter(d => {
    const date = new Date(d.date);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return iso === day;
  });
};

const filterCurrentPeriod = (
  data: LifetimeDataResponseDto,
  filters: DashboardFilterState,
  availableWeeks: WeekRange[],
): LifetimeDataDto[] => {
  switch (filters.viewMode) {
    case 'yearly':
      return filterByYear(data, filters.selectedYear);
    case 'monthly':
      return filterByMonth(data, filters.selectedYear, filters.selectedMonth);
    case 'weekly': {
      const week = availableWeeks[filters.selectedWeekIndex];
      return week ? filterByWeek(data, week) : [];
    }
    case 'daily':
      return filters.selectedDay ? filterByDay(data, filters.selectedDay) : [];
  }
};

const filterPreviousPeriod = (
  data: LifetimeDataResponseDto,
  filters: DashboardFilterState,
  availableWeeks: WeekRange[],
): LifetimeDataDto[] => {
  switch (filters.viewMode) {
    case 'yearly':
      return filterByYear(data, filters.selectedYear - 1);
    case 'monthly': {
      const prev = subMonths(new Date(filters.selectedYear, filters.selectedMonth, 1), 1);
      return filterByMonth(data, prev.getFullYear(), prev.getMonth());
    }
    case 'weekly': {
      const week = availableWeeks[filters.selectedWeekIndex];
      if (!week) return [];
      const prevStart = subDays(week.start, 7);
      const prevEnd = subDays(week.end, 7);
      return filterByWeek(data, { start: prevStart, end: prevEnd, label: '' });
    }
    case 'daily': {
      if (!filters.selectedDay) return [];
      const prev = subDays(new Date(filters.selectedDay), 1);
      const iso = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
      return filterByDay(data, iso);
    }
  }
};

const computeDelta = (current: number, previous: number): number | null => {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

export const useDashboardKpis = (
  data: LifetimeDataResponseDto,
  filters: DashboardFilterState,
  availableWeeks: WeekRange[],
): DashboardKpis => {
  return useMemo(() => {
    const currentData = filterCurrentPeriod(data, filters, availableWeeks);
    const previousData = filterPreviousPeriod(data, filters, availableWeeks);

    const current = aggregate(currentData);
    const previous = aggregate(previousData);

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
  }, [data, filters, availableWeeks]);
};
