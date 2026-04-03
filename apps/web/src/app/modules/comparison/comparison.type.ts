import type { MetricKey } from '../shared/metrics/metric.type';

export type ComparisonGranularity = 'years' | 'months' | 'days';

export type ComparisonChartType = 'bar' | 'line';

export type ComparisonMetricKey = MetricKey;

export type ComparisonResolution = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export type YearPeriod = { year: number };
export type MonthPeriod = { year: number; month: number };
export type DayPeriod = { date: string };

export type ComparisonPeriod = YearPeriod | MonthPeriod | DayPeriod;

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
  values: number[];
};
