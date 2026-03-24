import { fr } from 'date-fns/locale';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LifetimeDataResponseDto } from '@/shared-models';

import type { DashboardFilterState, DashboardMetricKey, DashboardViewMode } from '../dashboard.type';
import { getDaysForMonth } from './get-days-for-month';
import { getMonthsForYear } from './get-months-for-year';
import { getWeeksForMonth } from './get-weeks-for-month';

const STORAGE_KEY = 'dashboard-filters';

const VALID_VIEW_MODES: DashboardViewMode[] = ['yearly', 'monthly', 'weekly', 'daily'];
const VALID_METRICS: DashboardMetricKey[] = ['kwhProduced', 'kwhConsumed', 'kwhImported', 'kwhExported'];

const readFromStorage = (): Partial<DashboardFilterState> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const buildInitialState = (data: LifetimeDataResponseDto): DashboardFilterState => {
  const stored = readFromStorage();

  const availableYears = [...new Set(data.map(d => new Date(d.date).getFullYear()))].sort((a, b) => a - b);
  const latestYear = availableYears[availableYears.length - 1] ?? new Date().getFullYear();

  const viewMode = stored?.viewMode && VALID_VIEW_MODES.includes(stored.viewMode) ? stored.viewMode : 'yearly';

  const selectedYear =
    stored?.selectedYear && availableYears.includes(stored.selectedYear) ? stored.selectedYear : latestYear;

  const availableMonths = getMonthsForYear(data, selectedYear);
  const latestMonth = availableMonths[availableMonths.length - 1] ?? 0;

  const selectedMonth =
    stored?.selectedMonth !== undefined && availableMonths.includes(stored.selectedMonth)
      ? stored.selectedMonth
      : latestMonth;

  const availableWeeks = getWeeksForMonth(data, selectedYear, selectedMonth, fr);

  const selectedWeekIndex =
    stored?.selectedWeekIndex !== undefined &&
    stored.selectedWeekIndex >= 0 &&
    stored.selectedWeekIndex < availableWeeks.length
      ? stored.selectedWeekIndex
      : Math.max(0, availableWeeks.length - 1);

  const availableDays = getDaysForMonth(data, selectedYear, selectedMonth);
  const latestDay = availableDays[availableDays.length - 1] ?? null;

  const selectedDay =
    stored?.selectedDay && availableDays.includes(stored.selectedDay) ? stored.selectedDay : latestDay;

  const selectedMetric =
    stored?.selectedMetric && VALID_METRICS.includes(stored.selectedMetric) ? stored.selectedMetric : 'kwhConsumed';

  return { viewMode, selectedYear, selectedMonth, selectedWeekIndex, selectedDay, selectedMetric };
};

export const useDashboardFilters = (data: LifetimeDataResponseDto) => {
  const [filters, setFilters] = useState<DashboardFilterState>(() => buildInitialState(data));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const availableYears = useMemo(
    () => [...new Set(data.map(d => new Date(d.date).getFullYear()))].sort((a, b) => a - b),
    [data],
  );

  const availableMonths = useMemo(() => getMonthsForYear(data, filters.selectedYear), [data, filters.selectedYear]);

  const availableWeeks = useMemo(
    () => getWeeksForMonth(data, filters.selectedYear, filters.selectedMonth, fr),
    [data, filters.selectedYear, filters.selectedMonth],
  );

  const availableDays = useMemo(
    () => getDaysForMonth(data, filters.selectedYear, filters.selectedMonth),
    [data, filters.selectedYear, filters.selectedMonth],
  );

  const setViewMode = useCallback((viewMode: DashboardViewMode) => {
    setFilters(prev => ({ ...prev, viewMode }));
  }, []);

  const setYear = useCallback(
    (year: number) => {
      const months = getMonthsForYear(data, year);
      const monthValid = months.includes(filters.selectedMonth);
      const newMonth = monthValid ? filters.selectedMonth : (months[months.length - 1] ?? 0);

      const weeks = getWeeksForMonth(data, year, newMonth, fr);
      const days = getDaysForMonth(data, year, newMonth);

      setFilters(prev => ({
        ...prev,
        selectedYear: year,
        selectedMonth: newMonth,
        selectedWeekIndex: Math.max(0, weeks.length - 1),
        selectedDay: days[days.length - 1] ?? null,
      }));
    },
    [data, filters.selectedMonth],
  );

  const setMonth = useCallback(
    (month: number) => {
      const weeks = getWeeksForMonth(data, filters.selectedYear, month, fr);
      const days = getDaysForMonth(data, filters.selectedYear, month);

      setFilters(prev => ({
        ...prev,
        selectedMonth: month,
        selectedWeekIndex: Math.max(0, weeks.length - 1),
        selectedDay: days[days.length - 1] ?? null,
      }));
    },
    [data, filters.selectedYear],
  );

  const setWeek = useCallback((weekIndex: number) => {
    setFilters(prev => ({ ...prev, selectedWeekIndex: weekIndex }));
  }, []);

  const setDay = useCallback((day: string) => {
    setFilters(prev => ({ ...prev, selectedDay: day }));
  }, []);

  const setMetric = useCallback((metric: DashboardMetricKey) => {
    setFilters(prev => ({ ...prev, selectedMetric: metric }));
  }, []);

  return {
    filters,
    availableYears,
    availableMonths,
    availableWeeks,
    availableDays,
    setViewMode,
    setYear,
    setMonth,
    setWeek,
    setDay,
    setMetric,
  };
};
