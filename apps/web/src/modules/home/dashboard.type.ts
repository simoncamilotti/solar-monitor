export type DashboardViewMode = 'full' | 'yearly' | 'monthly' | 'custom';

export type DateRange = {
  min: string | null;
  max: string | null;
};

export type DashboardFilterState = {
  viewMode: DashboardViewMode;
  selectedYear: number;
  selectedMonth: number;
  customStartDate: string | null;
  customEndDate: string | null;
};
