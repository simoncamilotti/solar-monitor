import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ComparisonFilterState, ComparisonMetricKey, ComparisonSeries } from '../comparison.type';

const PERCENTAGE_METRICS: ComparisonMetricKey[] = ['autonomy', 'selfConsumption', 'gridDependency'];

const getUnit = (metric: ComparisonMetricKey): string => (PERCENTAGE_METRICS.includes(metric) ? '%' : 'kWh');

export const useComparisonChart = (
  series: ComparisonSeries[],
  filters: ComparisonFilterState,
): EChartsOption | undefined => {
  const { t } = useTranslation('web');

  return useMemo(() => {
    if (series.length === 0) {
      return undefined;
    }

    const unit = getUnit(filters.metric);
    const metricLabel = t(`compare.metrics.${filters.metric}`);
    const isLine = filters.chartType === 'line';
    const isDays = filters.granularity === 'days';

    if (isDays) {
      const categories = series.map(s => s.label);
      const values = series.map(s => s.values[0] ?? 0);
      const colors = series.map(s => s.color);

      return {
        grid: { top: 10, left: 55, right: 20, bottom: 30, containLabel: false },
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: { fontSize: 11 },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', opacity: 0.3 } },
          axisLabel: { fontSize: 11, formatter: `{value} ${unit}` },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            const p = Array.isArray(params) ? params[0] : params;
            const value = Number(p.value).toFixed(1);
            return `<b>${metricLabel}</b><br>${p.marker}${p.name}<span style="float:right;margin-left:20px"><b>${value} ${unit}</b></span>`;
          },
        },
        series: [
          {
            type: isLine ? 'line' : 'bar',
            data: values.map((v, i) => ({
              value: v,
              itemStyle: { color: colors[i], borderRadius: isLine ? undefined : [5, 5, 0, 0] },
            })),
            ...(isLine ? { smooth: true, symbol: 'circle', symbolSize: 6 } : {}),
          },
        ],
      };
    }

    const categories = series[0].categories;

    return {
      grid: { top: 40, left: 55, right: 20, bottom: 30, containLabel: false },
      legend: {
        top: 0,
        data: series.map(s => ({
          name: s.label,
          itemStyle: { color: s.color },
        })),
        textStyle: { fontSize: 11 },
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.3 } },
        axisLabel: { fontSize: 11, formatter: `{value} ${unit}` },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: isLine ? 'line' : 'shadow' },
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];
          const title = `<b>${items[0].name}</b>`;
          const lines = items.map(
            (p: any) =>
              `${p.marker}${p.seriesName}<span style="float:right;margin-left:20px"><b>${Number(p.value).toFixed(1)} ${unit}</b></span>`,
          );
          return [title, ...lines].join('<br>');
        },
      },
      series: series.map(s => ({
        name: s.label,
        type: isLine ? 'line' : 'bar',
        data: s.values,
        itemStyle: {
          color: s.color,
          ...(isLine ? {} : { borderRadius: [5, 5, 0, 0] }),
        },
        ...(isLine ? { smooth: true, symbol: 'circle', symbolSize: 4 } : {}),
      })),
    };
  }, [series, filters, t]);
};
