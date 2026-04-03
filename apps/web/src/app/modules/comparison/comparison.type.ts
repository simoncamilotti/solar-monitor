export type ComparisonGranularity = 'years' | 'months' | 'days';

export type ComparisonChartType = 'bar' | 'line';

export type ComparisonMetricKey =
  | 'kwhProduced'
  | 'kwhConsumed'
  | 'kwhImported'
  | 'kwhExported'
  | 'autonomy'
  | 'selfConsumption'
  | 'gridDependency';

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
