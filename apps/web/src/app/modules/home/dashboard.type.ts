import type { EnergyMetricKey } from '../shared/metrics';

export type DashboardViewMode = 'full' | 'yearly' | 'monthly' | 'custom';
export type DashboardMetricKey = EnergyMetricKey;

export type DateRange = {
  min: string | null;
  max: string | null;
};

export type DashboardFilterState = {
  viewMode: DashboardViewMode;
  selectedYear: number;
  selectedMonth: number;
  selectedMetric: DashboardMetricKey;
  customStartDate: string | null;
  customEndDate: string | null;
};
