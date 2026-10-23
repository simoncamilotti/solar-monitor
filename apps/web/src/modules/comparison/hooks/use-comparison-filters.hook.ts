import { parseISO } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LifetimeDay } from '@repo/contracts';

import { ALL_METRICS } from '../../shared/metrics/index.js';
import type {
  ComparisonChartType,
  ComparisonFilterState,
  ComparisonGranularity,
  ComparisonMetricKey,
  ComparisonPeriod,
  ComparisonResolution,
  DayPeriod,
  MonthPeriod,
  RangePeriod,
  YearPeriod,
} from '../comparison.type.js';
import { MAX_COMPARISON_PERIODS } from '../comparison-presets.js';
import { getRangeResolutions } from '../comparison-ranges.js';

const STORAGE_KEY = 'comparison-filters';

const VALID_GRANULARITIES: ComparisonGranularity[] = ['years', 'months', 'days', 'ranges'];
const VALID_CHART_TYPES: ComparisonChartType[] = ['bar', 'line'];

const RESOLUTIONS_BY_GRANULARITY: Record<ComparisonGranularity, ComparisonResolution[]> = {
  years: ['monthly', 'quarterly', 'daily'],
  months: ['daily', 'weekly'],
  days: [],
  ranges: ['daily', 'weekly', 'monthly'],
};

const DEFAULT_RESOLUTION: Record<ComparisonGranularity, ComparisonResolution> = {
  years: 'monthly',
  months: 'daily',
  days: 'daily',
  ranges: 'daily',
};

const readFromStorage = (): Partial<ComparisonFilterState> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isYearPeriod = (p: ComparisonPeriod): p is YearPeriod =>
  'year' in p && !('month' in p);

export const isMonthPeriod = (p: ComparisonPeriod): p is MonthPeriod => 'year' in p && 'month' in p;

export const isDayPeriod = (p: ComparisonPeriod): p is DayPeriod => 'date' in p;

export const isRangePeriod = (p: ComparisonPeriod): p is RangePeriod => 'start' in p && 'end' in p;

/** The groupings a comparison offers: for ranges, they depend on how long the ranges last. */
const getAvailableResolutions = (
  granularity: ComparisonGranularity,
  periods: ComparisonPeriod[],
): ComparisonResolution[] =>
  granularity === 'ranges'
    ? getRangeResolutions(periods.filter(isRangePeriod))
    : RESOLUTIONS_BY_GRANULARITY[granularity];

/** The chosen grouping, or the default one when the periods no longer allow it. */
const getEffectiveResolution = (filters: ComparisonFilterState): ComparisonResolution =>
  getAvailableResolutions(filters.granularity, filters.periods).includes(filters.resolution)
    ? filters.resolution
    : DEFAULT_RESOLUTION[filters.granularity];

const periodsEqual = (a: ComparisonPeriod, b: ComparisonPeriod): boolean => {
  if (isYearPeriod(a) && isYearPeriod(b)) {
    return a.year === b.year;
  }
  if (isMonthPeriod(a) && isMonthPeriod(b)) {
    return a.year === b.year && a.month === b.month;
  }
  if (isDayPeriod(a) && isDayPeriod(b)) {
    return a.date === b.date;
  }
  if (isRangePeriod(a) && isRangePeriod(b)) {
    return a.start === b.start && a.end === b.end;
  }
  return false;
};

const buildInitialState = (): ComparisonFilterState => {
  const stored = readFromStorage();

  const granularity =
    stored?.granularity && VALID_GRANULARITIES.includes(stored.granularity)
      ? stored.granularity
      : 'years';

  const metric =
    stored?.metric && ALL_METRICS.includes(stored.metric) ? stored.metric : 'kwhConsumed';

  const chartType =
    stored?.chartType && VALID_CHART_TYPES.includes(stored.chartType) ? stored.chartType : 'bar';

  const availableResolutions = RESOLUTIONS_BY_GRANULARITY[granularity];
  const resolution =
    stored?.resolution && availableResolutions.includes(stored.resolution)
      ? stored.resolution
      : DEFAULT_RESOLUTION[granularity];

  const periods =
    stored?.periods && Array.isArray(stored.periods)
      ? stored.periods.slice(0, MAX_COMPARISON_PERIODS)
      : [];

  return { granularity, periods, metric, resolution, chartType };
};

export const useComparisonFilters = (data: LifetimeDay[]) => {
  const [filters, setFilters] = useState<ComparisonFilterState>(() => buildInitialState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const availableYears = useMemo(
    () => [...new Set(data.map((d) => parseISO(d.date).getFullYear()))].sort((a, b) => a - b),
    [data],
  );

  const availableMonths = useMemo(() => {
    const months = new Map<string, { year: number; month: number }>();
    for (const d of data) {
      const date = parseISO(d.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!months.has(key)) {
        months.set(key, { year: date.getFullYear(), month: date.getMonth() });
      }
    }
    return [...months.values()].sort((a, b) => a.year - b.year || a.month - b.month);
  }, [data]);

  // Already `yyyy-MM-dd`: no need to round-trip through a `Date`.
  const availableDays = useMemo(() => data.map((d) => d.date).sort(), [data]);

  const availableResolutions = getAvailableResolutions(filters.granularity, filters.periods);

  const setGranularity = useCallback((granularity: ComparisonGranularity) => {
    setFilters((prev) => ({
      ...prev,
      granularity,
      periods: [],
      resolution: DEFAULT_RESOLUTION[granularity],
    }));
  }, []);

  const addPeriod = useCallback((period: ComparisonPeriod) => {
    setFilters((prev) => {
      const exists = prev.periods.some((p) => periodsEqual(p, period));
      if (exists || prev.periods.length >= MAX_COMPARISON_PERIODS) return prev;
      return { ...prev, periods: [...prev.periods, period] };
    });
  }, []);

  /** Replaces the comparison with a ready-made one. */
  const applyPreset = useCallback(
    (granularity: ComparisonGranularity, periods: ComparisonPeriod[]) => {
      setFilters((prev) => ({
        ...prev,
        granularity,
        periods: periods.slice(0, MAX_COMPARISON_PERIODS),
        resolution: DEFAULT_RESOLUTION[granularity],
      }));
    },
    [],
  );

  const removePeriod = useCallback((period: ComparisonPeriod) => {
    setFilters((prev) => ({
      ...prev,
      periods: prev.periods.filter((p) => !periodsEqual(p, period)),
    }));
  }, []);

  const setMetric = useCallback((metric: ComparisonMetricKey) => {
    setFilters((prev) => ({ ...prev, metric }));
  }, []);

  const setResolution = useCallback((resolution: ComparisonResolution) => {
    setFilters((prev) => ({ ...prev, resolution }));
  }, []);

  const setChartType = useCallback((chartType: ComparisonChartType) => {
    setFilters((prev) => ({ ...prev, chartType }));
  }, []);

  // Adding a short range can rule out the chosen grouping: fall back without forgetting it.
  const effectiveFilters = useMemo(
    () => ({ ...filters, resolution: getEffectiveResolution(filters) }),
    [filters],
  );

  return {
    filters: effectiveFilters,
    availableYears,
    availableMonths,
    availableDays,
    availableResolutions,
    setGranularity,
    addPeriod,
    applyPreset,
    removePeriod,
    setMetric,
    setResolution,
    setChartType,
  };
};
