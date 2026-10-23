import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  energyScale,
  type EnergyScale,
  formatAxisValue,
  formatNumber,
  formatScaled,
} from '../../shared/format/index.js';
import { getChartColors, useDisplayedTheme } from '../../shared/metrics/energy-colors.js';
import { getMetricUnit } from '../../shared/metrics/index.js';
import type { ComparisonFilterState, ComparisonSeries } from '../comparison.type.js';

export const useComparisonChart = (
  series: ComparisonSeries[],
  filters: ComparisonFilterState,
): EChartsOption | undefined => {
  const { t, i18n } = useTranslation();
  const theme = useDisplayedTheme();

  return useMemo(() => {
    if (series.length === 0) {
      return undefined;
    }

    const language = i18n.language;
    // Percentages keep their unit; energies share the unit of the largest value drawn.
    const scale: EnergyScale | null =
      getMetricUnit(filters.metric) === '%' ? null : energyScale(series.flatMap((s) => s.values));
    const unit = scale?.unit ?? '%';
    const formatValue = (value: number) =>
      scale ? formatScaled(value, scale, language) : `${formatNumber(value, language)}\u00a0%`;
    const metricLabel = t(`compare.metrics.${filters.metric}`);
    const isLine = filters.chartType === 'line';
    const isDays = filters.granularity === 'days';
    const chrome = getChartColors(theme);
    const axis = {
      axisLabel: { fontSize: 11, color: chrome.text },
      axisLine: { lineStyle: { color: chrome.axis } },
    };
    const valueAxis = {
      type: 'value' as const,
      splitLine: { lineStyle: { type: 'dashed' as const, color: chrome.grid } },
      axisLabel: {
        fontSize: 11,
        color: chrome.text,
        formatter: (value: number) =>
          `${scale ? formatAxisValue(value, scale, language) : formatNumber(value, language, 0)} ${unit}`,
      },
    };
    const tooltipStyle = {
      backgroundColor: chrome.tooltip,
      borderColor: chrome.grid,
      textStyle: { color: chrome.text },
    };

    if (isDays) {
      const categories = series.map((s) => s.label);
      const values = series.map((s) => s.values[0] ?? 0);
      const colors = series.map((s) => s.color);

      return {
        grid: { top: 10, left: 55, right: 20, bottom: 30, containLabel: false },
        xAxis: { type: 'category', data: categories, ...axis },
        yAxis: valueAxis,
        tooltip: {
          ...tooltipStyle,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            const p = Array.isArray(params) ? params[0] : params;
            return `<b>${metricLabel}</b><br>${p.marker}${p.name}<span style="float:right;margin-left:20px"><b>${formatValue(Number(p.value))}</b></span>`;
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

    const categories = series[0]?.categories ?? [];

    return {
      grid: { top: 40, left: 55, right: 20, bottom: 30, containLabel: false },
      legend: {
        top: 0,
        data: series.map((s) => ({
          name: s.label,
          itemStyle: { color: s.color },
        })),
        textStyle: { fontSize: 11, color: chrome.text },
      },
      xAxis: { type: 'category', data: categories, ...axis },
      yAxis: valueAxis,
      tooltip: {
        ...tooltipStyle,
        trigger: 'axis',
        axisPointer: { type: isLine ? 'line' : 'shadow' },
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];
          const title = `<b>${items[0].name}</b>`;
          const lines = items.map(
            (p: any) =>
              `${p.marker}${p.seriesName}<span style="float:right;margin-left:20px"><b>${formatValue(Number(p.value))}</b></span>`,
          );
          return [title, ...lines].join('<br>');
        },
      },
      series: series.map((s) => ({
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
  }, [series, filters, t, i18n.language, theme]);
};
