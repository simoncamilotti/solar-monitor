import { format, parse, parseISO } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LifetimeDataResponseDto } from '@/shared-models';

import { ENERGY_METRICS } from '../../shared/metrics';
import type { DashboardFilterState, DashboardMetricKey, DashboardViewMode } from '../dashboard.type';
import { getMonthsForYear } from './get-months-for-year';

const STORAGE_KEY = 'dashboard-filters';

const VALID_VIEW_MODES: DashboardViewMode[] = ['full', 'yearly', 'monthly', 'custom'];

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

  const availableYears = [...new Set(data.map(d => parseISO(d.date).getFullYear()))].sort((a, b) => a - b);
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

  const selectedMetric =
    stored?.selectedMetric && ENERGY_METRICS.includes(stored.selectedMetric) ? stored.selectedMetric : 'kwhConsumed';

  const getCustomDate = (key: 'customStartDate' | 'customEndDate'): string | null => {
    if (data.length === 0) {
      return null;
    }

    const index = key === 'customStartDate' ? 0 : data.length - 1;

    if (stored != null && stored[key] != null) {
      const formatedDate = format(parseISO(stored[key]!), 'yyyy-MM-dd');

      const isInData = data.some(d => d.date === formatedDate);

      return isInData ? formatedDate : (data[index]?.date ?? null);
    }

    return data[index]?.date ?? null;
  };

  const customStartDate = getCustomDate('customStartDate');
  const customEndDate = getCustomDate('customEndDate');

  return {
    viewMode,
    selectedYear,
    selectedMonth,
    selectedMetric,
    customStartDate,
    customEndDate,
  };
};

export const useDashboardFilters = (data: LifetimeDataResponseDto) => {
  const [filters, setFilters] = useState<DashboardFilterState>(() => buildInitialState(data));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const availableYears = useMemo(
    () => [...new Set(data.map(d => parseISO(d.date).getFullYear()))].sort((a, b) => a - b),
    [data],
  );

  const availableMonths = useMemo(() => getMonthsForYear(data, filters.selectedYear), [data, filters.selectedYear]);

  const setViewMode = useCallback((viewMode: DashboardViewMode) => {
    setFilters(prev => ({ ...prev, viewMode }));
  }, []);

  const setYear = useCallback(
    (year: number | null) => {
      if (year == null) {
        return;
      }
      const months = getMonthsForYear(data, year);
      const monthValid = months.includes(filters.selectedMonth);
      const newMonth = monthValid ? filters.selectedMonth : (months[months.length - 1] ?? 0);

      setFilters(prev => ({
        ...prev,
        selectedYear: year,
        selectedMonth: newMonth,
      }));
    },
    [data, filters.selectedMonth],
  );

  const setMonth = useCallback(
    (month: string | null) => {
      if (month == null) {
        return;
      }

      const parsed = parse(month, 'yyyy-MM', new Date());
      const year = parsed.getFullYear();
      const selectedMonth = parsed.getMonth();

      setFilters(prev => ({
        ...prev,
        selectedYear: year,
        selectedMonth: selectedMonth,
      }));
    },
    [data, filters.selectedYear],
  );

  const setMetric = useCallback((metric: DashboardMetricKey) => {
    setFilters(prev => ({ ...prev, selectedMetric: metric }));
  }, []);

  const setCustomRange = useCallback((startDate: string | null, endDate: string | null) => {
    setFilters(prev => ({ ...prev, customStartDate: startDate, customEndDate: endDate }));
  }, []);

  const dateRange: { min: string | null; max: string | null } = useMemo(() => {
    // ISO `yyyy-MM-dd` strings sort lexicographically in chronological order — no need for `Date`.
    const dates = data.map(d => d.date).sort();
    return { min: dates[0] ?? null, max: dates[dates.length - 1] ?? null };
  }, [data]);

  return {
    filters,
    availableYears,
    availableMonths,
    dateRange,
    setViewMode,
    setYear,
    setMonth,
    setMetric,
    setCustomRange,
  };
};
