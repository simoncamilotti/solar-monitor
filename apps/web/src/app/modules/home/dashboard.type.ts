export type DashboardViewMode = 'full' | 'yearly' | 'monthly' | 'custom';
export type DashboardMetricKey = 'kwhProduced' | 'kwhConsumed' | 'kwhImported' | 'kwhExported';

export type DateRange = {
  min: Date | null;
  max: Date | null;
};

export type DashboardFilterState = {
  viewMode: DashboardViewMode;
  selectedYear: number;
  selectedMonth: number;
  selectedMetric: DashboardMetricKey;
  customStartDate: string | null;
  customEndDate: string | null;
};
