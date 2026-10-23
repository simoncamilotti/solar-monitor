import type { MetricKey } from '../shared/metrics/metric.type.js';

export type ComparisonGranularity = 'years' | 'months' | 'days' | 'ranges';

export type ComparisonChartType = 'bar' | 'line';

export type ComparisonMetricKey = MetricKey;

export type ComparisonResolution = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export type YearPeriod = { year: number };
export type MonthPeriod = { year: number; month: number };
export type DayPeriod = { date: string };
/** Free range of days, `yyyy-MM-dd`, both bounds included. */
export type RangePeriod = { start: string; end: string; name?: string };

export type ComparisonPeriod = YearPeriod | MonthPeriod | DayPeriod | RangePeriod;

export type ComparisonFilterState = {
  granularity: ComparisonGranularity;
  periods: ComparisonPeriod[];
  metric: ComparisonMetricKey;
  resolution: ComparisonResolution;
  chartType: ComparisonChartType;
};

export type ComparisonSeries = {
  label: string;
  color: string;
  categories: string[];
  /** `null` past the end of a period shorter than the longest one. */
  values: (number | null)[];
};
