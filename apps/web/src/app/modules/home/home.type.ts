export type ViewMode = 'monthly' | 'yearly';
export type CompareRange = 1 | 2 | 3;
export type MetricKey = 'kwhConsumed' | 'kwhProduced' | 'kwhImported' | 'kwhExported';

export type Metric = {
  key: MetricKey;
  label: string;
  enabled: boolean;
};

export type ComparisonParams = {
  viewMode: ViewMode;
  selectedYear: number;
  selectedMonth: number;
  compareRange: CompareRange;
  metrics: Metric[];
};
