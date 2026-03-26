import type { FunctionComponent } from 'react';

import type { LifetimeDataResponseDto } from '@/shared-models';

import { useDashboardChart } from '../hooks/use-dashboard-chart.hook';
import { useDashboardFilters } from '../hooks/use-dashboard-filters.hook';
import { useDashboardKpis } from '../hooks/use-dashboard-kpis.hook';
import { DashboardChart } from './DashboardChart';
import { DashboardFilters } from './DashboardFilters';
import { DashboardKPIGrid } from './DashboardKPIGrid';

export const DashboardContent: FunctionComponent<{ data: LifetimeDataResponseDto }> = ({ data }) => {
  const {
    filters,
    availableYears,
    availableMonths,
    dateRange,
    setViewMode,
    setYear,
    setMonth,
    setMetric,
    setCustomRange,
  } = useDashboardFilters(data);

  const kpis = useDashboardKpis(data, filters);
  const chartOptions = useDashboardChart(data, filters);

  return (
    <div className="flex flex-col gap-4 flex-1">
      <DashboardFilters
        filters={filters}
        availableYears={availableYears}
        availableMonths={availableMonths}
        dateRange={dateRange}
        onViewModeChange={setViewMode}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onCustomRangeChange={setCustomRange}
      />
      <DashboardKPIGrid kpis={kpis} />
      <DashboardChart chartOptions={chartOptions} selectedMetric={filters.selectedMetric} onMetricChange={setMetric} />
    </div>
  );
};
