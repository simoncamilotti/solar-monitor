import { endOfMonth, isAfter, isBefore, startOfMonth, subMonths } from 'date-fns';
import type { BarSeriesOption, EChartsOption } from 'echarts';
import { useTranslation } from 'react-i18next';

import type { LifetimeDataDto, LifetimeDataResponseDto } from '@/shared-models';

import type { ComparisonParams, MetricKey } from '../home.type';

const sumByIndicators = (entries: LifetimeDataDto[], metricKeys: MetricKey[]): number[] =>
  metricKeys.map(key => entries.reduce((sum, entry) => sum + entry[key], 0));

export const useComparisonChart = (data: LifetimeDataResponseDto, params: ComparisonParams) => {
  const { t } = useTranslation('web');

  const enabledIndicators = params.metrics.filter(i => i.enabled).map(i => i.key);

  const series =
    params.viewMode === 'yearly'
      ? buildYearlySeries(data, params, enabledIndicators)
      : buildMonthlySeries(data, params, enabledIndicators, t);

  const chartOptions: EChartsOption = {
    grid: { top: 0, left: 0, right: 0 },
    color: ['#ab30e8', '#22cc75', '#fa0158', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
    xAxis: {
      type: 'category',
      data: enabledIndicators,
    },
    yAxis: { type: 'value' },
    legend: {},
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    series,
  };

  return { chartOptions };
};

const buildYearlySeries = (
  data: LifetimeDataResponseDto,
  params: ComparisonParams,
  indicators: MetricKey[],
): BarSeriesOption[] => {
  const minYear = params.selectedYear - (params.compareRange - 1);

  const years = [...new Set(data.map(d => new Date(d.date).getFullYear()))]
    .filter(y => y >= minYear && y <= params.selectedYear)
    .sort((a, b) => a - b);

  return years.map(year => {
    const entries = data.filter(d => new Date(d.date).getFullYear() === year);
    return {
      name: String(year),
      type: 'bar' as const,
      itemStyle: {
        borderRadius: [5, 5, 0, 0],
      },
      data: sumByIndicators(entries, indicators),
    };
  });
};

const buildMonthlySeries = (
  data: LifetimeDataResponseDto,
  params: ComparisonParams,
  indicators: MetricKey[],
  t: (key: string) => string,
): BarSeriesOption[] => {
  const maxDate = endOfMonth(new Date(params.selectedYear, params.selectedMonth));
  const minDate = startOfMonth(subMonths(maxDate, params.compareRange - 1));

  const filtered = data.filter(d => isAfter(d.date, minDate) && isBefore(d.date, maxDate));

  const months = [...new Set(filtered.map(d => new Date(d.date).getMonth()))].sort((a, b) => a - b);

  return months.map(month => {
    const entries = filtered.filter(d => new Date(d.date).getMonth() === month);
    return {
      name: t(`months.${month}`),
      type: 'bar' as const,
      itemStyle: {
        borderRadius: [5, 5, 0, 0],
      },
      data: sumByIndicators(entries, indicators),
    };
  });
};
