import type { FunctionComponent } from 'react';

import type { LifetimeDataResponseDto } from '@/shared-models';

import { useComparisonChart } from '../hooks/use-comparison-chart.hook';
import { useComparisonData } from '../hooks/use-comparison-data.hook';
import { useComparisonFilters } from '../hooks/use-comparison-filters.hook';
import { ComparisonChart } from './ComparisonChart';
import { ComparisonFilters } from './ComparisonFilters';

export const ComparisonContent: FunctionComponent<{ data: LifetimeDataResponseDto }> = ({ data }) => {
  const {
    filters,
    availableYears,
    availableResolutions,
    setGranularity,
    addPeriod,
    removePeriod,
    setMetric,
    setResolution,
    setChartType,
  } = useComparisonFilters(data);

  const series = useComparisonData(data, filters);
  const chartOptions = useComparisonChart(series, filters);

  return (
    <div className="flex flex-col gap-4 flex-1">
      <ComparisonFilters
        granularity={filters.granularity}
        resolution={filters.resolution}
        periods={filters.periods}
        availableYears={availableYears}
        availableResolutions={availableResolutions}
        onGranularityChange={setGranularity}
        onResolutionChange={setResolution}
        onAddPeriod={addPeriod}
        onRemovePeriod={removePeriod}
      />
      <ComparisonChart
        chartOptions={chartOptions}
        selectedMetric={filters.metric}
        chartType={filters.chartType}
        onMetricChange={setMetric}
        onChartTypeChange={setChartType}
      />
    </div>
  );
};
