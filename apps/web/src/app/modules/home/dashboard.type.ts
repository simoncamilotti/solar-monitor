export type DashboardViewMode = 'yearly' | 'monthly' | 'weekly' | 'daily';
export type DashboardMetricKey = 'kwhProduced' | 'kwhConsumed' | 'kwhImported' | 'kwhExported';

export type WeekRange = {
  start: Date;
  end: Date;
  label: string;
};

export type DashboardFilterState = {
  viewMode: DashboardViewMode;
  selectedYear: number;
  selectedMonth: number;
  selectedWeekIndex: number;
  selectedDay: string | null;
  selectedMetric: DashboardMetricKey;
};
