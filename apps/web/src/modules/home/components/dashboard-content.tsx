import { type FunctionComponent, useMemo } from 'react';

import type { LifetimeDay } from '@repo/contracts';

import { computeEnergySplit } from '../../shared/metrics/energy-split.js';
import { computeRecords } from '../../shared/metrics/index.js';
import { getKpiSparklines } from '../hooks/dashboard-buckets.js';
import { useDashboardBuckets } from '../hooks/use-dashboard-buckets.hook.js';
import { useDashboardChart } from '../hooks/use-dashboard-chart.hook.js';
import { useDashboardFilters } from '../hooks/use-dashboard-filters.hook.js';
import { useDashboardKpis } from '../hooks/use-dashboard-kpis.hook.js';
import { SavingsSection } from '../../savings/components/savings-section.js';
import { DashboardChart } from './dashboard-chart.js';
import { DashboardFilters } from './dashboard-filters.js';
import { DashboardKPIGrid } from './dashboard-kpi-grid.js';
import { RecordsCard } from './records-card.js';
import { SunShareCard } from './sun-share-card.js';

export const DashboardContent: FunctionComponent<{ data: LifetimeDay[] }> = ({ data }) => {
  const {
    filters,
    availableYears,
    availableMonths,
    dateRange,
    setViewMode,
    setYear,
    setMonth,
    setCustomRange,
  } = useDashboardFilters(data);

  const kpis = useDashboardKpis(data, filters);
  const buckets = useDashboardBuckets(data, filters);
  const chartOptions = useDashboardChart(buckets);
  const sparklines = useMemo(() => getKpiSparklines(buckets), [buckets]);
  const split = useMemo(() => computeEnergySplit(buckets.flatMap((b) => b.entries)), [buckets]);
  const records = useMemo(() => computeRecords(data), [data]);

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
      <DashboardKPIGrid kpis={kpis} sparklines={sparklines} />
      <SavingsSection data={data} filters={filters} />
      <div className="flex flex-col lg:flex-row gap-4">
        <DashboardChart chartOptions={chartOptions} viewMode={filters.viewMode} />
        <SunShareCard split={split} />
      </div>
      {records && (
        <RecordsCard
          records={records}
          onSelectRange={(from, to) => {
            setCustomRange(from, to);
            setViewMode('custom');
          }}
          onSelectMonth={(month) => {
            setMonth(month);
            setViewMode('monthly');
          }}
          onSelectAll={() => setViewMode('full')}
        />
      )}
    </div>
  );
};
