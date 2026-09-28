import type { FunctionComponent } from 'react';

import type { LifetimeDataResponseDto } from '@repo/contracts';

import { useDashboardChart } from '../hooks/use-dashboard-chart.hook.js';
import { useDashboardFilters } from '../hooks/use-dashboard-filters.hook.js';
import { useDashboardKpis } from '../hooks/use-dashboard-kpis.hook.js';
import { DashboardChart } from './dashboard-chart.js';
import { DashboardFilters } from './dashboard-filters.js';
import { DashboardKPIGrid } from './dashboard-kpi-grid.js';

export const DashboardContent: FunctionComponent<{ data: LifetimeDataResponseDto }> = ({
  data,
}) => {
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
      <DashboardChart
        chartOptions={chartOptions}
        selectedMetric={filters.selectedMetric}
        onMetricChange={setMetric}
      />
    </div>
  );
};
