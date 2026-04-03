import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LifetimeDataResponseDto } from '@/shared-models';

import type {
  ComparisonChartType,
  ComparisonFilterState,
  ComparisonGranularity,
  ComparisonMetricKey,
  ComparisonPeriod,
  ComparisonResolution,
  DayPeriod,
  MonthPeriod,
  YearPeriod,
} from '../comparison.type';

const STORAGE_KEY = 'comparison-filters';

const VALID_GRANULARITIES: ComparisonGranularity[] = ['years', 'months', 'days'];
const VALID_METRICS: ComparisonMetricKey[] = [
  'kwhProduced',
  'kwhConsumed',
  'kwhImported',
  'kwhExported',
  'autonomy',
  'selfConsumption',
  'gridDependency',
];
const VALID_CHART_TYPES: ComparisonChartType[] = ['bar', 'line'];

const RESOLUTIONS_BY_GRANULARITY: Record<ComparisonGranularity, ComparisonResolution[]> = {
  years: ['monthly', 'quarterly', 'daily'],
  months: ['daily', 'weekly'],
  days: [],
};

const DEFAULT_RESOLUTION: Record<ComparisonGranularity, ComparisonResolution> = {
  years: 'monthly',
  months: 'daily',
  days: 'daily',
};

const readFromStorage = (): Partial<ComparisonFilterState> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isYearPeriod = (p: ComparisonPeriod): p is YearPeriod => 'year' in p && !('month' in p) && !('date' in p);

export const isMonthPeriod = (p: ComparisonPeriod): p is MonthPeriod => 'year' in p && 'month' in p;

export const isDayPeriod = (p: ComparisonPeriod): p is DayPeriod => 'date' in p;

const periodsEqual = (a: ComparisonPeriod, b: ComparisonPeriod): boolean => {
  if (isYearPeriod(a) && isYearPeriod(b)) return a.year === b.year;
  if (isMonthPeriod(a) && isMonthPeriod(b)) return a.year === b.year && a.month === b.month;
  if (isDayPeriod(a) && isDayPeriod(b)) return a.date === b.date;
  return false;
};

const buildInitialState = (): ComparisonFilterState => {
  const stored = readFromStorage();

  const granularity =
    stored?.granularity && VALID_GRANULARITIES.includes(stored.granularity) ? stored.granularity : 'years';

  const metric = stored?.metric && VALID_METRICS.includes(stored.metric) ? stored.metric : 'kwhConsumed';

  const chartType = stored?.chartType && VALID_CHART_TYPES.includes(stored.chartType) ? stored.chartType : 'bar';

  const availableResolutions = RESOLUTIONS_BY_GRANULARITY[granularity];
  const resolution =
    stored?.resolution && availableResolutions.includes(stored.resolution)
      ? stored.resolution
      : DEFAULT_RESOLUTION[granularity];

  const periods = stored?.periods && Array.isArray(stored.periods) ? stored.periods : [];

  return { granularity, periods, metric, resolution, chartType };
};

export const useComparisonFilters = (data: LifetimeDataResponseDto) => {
  const [filters, setFilters] = useState<ComparisonFilterState>(() => buildInitialState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const availableYears = useMemo(
    () => [...new Set(data.map(d => new Date(d.date).getFullYear()))].sort((a, b) => a - b),
    [data],
  );

  const availableMonths = useMemo(() => {
    const months = new Map<string, { year: number; month: number }>();
    for (const d of data) {
      const date = new Date(d.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!months.has(key)) {
        months.set(key, { year: date.getFullYear(), month: date.getMonth() });
      }
    }
    return [...months.values()].sort((a, b) => a.year - b.year || a.month - b.month);
  }, [data]);

  const availableDays = useMemo(
    () =>
      data
        .map(d => {
          const date = new Date(d.date);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        })
        .sort(),
    [data],
  );

  const availableResolutions = RESOLUTIONS_BY_GRANULARITY[filters.granularity];

  const setGranularity = useCallback((granularity: ComparisonGranularity) => {
    setFilters(prev => ({
      ...prev,
      granularity,
      periods: [],
      resolution: DEFAULT_RESOLUTION[granularity],
    }));
  }, []);

  const addPeriod = useCallback((period: ComparisonPeriod) => {
    setFilters(prev => {
      const exists = prev.periods.some(p => periodsEqual(p, period));
      if (exists) return prev;
      return { ...prev, periods: [...prev.periods, period] };
    });
  }, []);

  const removePeriod = useCallback((period: ComparisonPeriod) => {
    setFilters(prev => ({
      ...prev,
      periods: prev.periods.filter(p => !periodsEqual(p, period)),
    }));
  }, []);

  const setMetric = useCallback((metric: ComparisonMetricKey) => {
    setFilters(prev => ({ ...prev, metric }));
  }, []);

  const setResolution = useCallback((resolution: ComparisonResolution) => {
    setFilters(prev => ({ ...prev, resolution }));
  }, []);

  const setChartType = useCallback((chartType: ComparisonChartType) => {
    setFilters(prev => ({ ...prev, chartType }));
  }, []);

  return {
    filters,
    availableYears,
    availableMonths,
    availableDays,
    availableResolutions,
    setGranularity,
    addPeriod,
    removePeriod,
    setMetric,
    setResolution,
    setChartType,
  };
};
