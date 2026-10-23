import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getChartColors,
  getEnergyColors,
  useDisplayedTheme,
} from '../../shared/metrics/energy-colors.js';
import { computeEnergySplit, type EnergySplit } from '../../shared/metrics/energy-split.js';
import type { DashboardBucket } from './dashboard-buckets.js';

type ChartLabels = {
  produced: string;
  consumed: string;
  selfConsumed: string;
  exported: string;
  imported: string;
};

type ChartPalette = ReturnType<typeof getEnergyColors> & ReturnType<typeof getChartColors>;

const kwh = (value: number) => `${value.toFixed(1)} kWh`;

const tooltipRow = (color: string, label: string, value: number) =>
  `<div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:2px;background:${color}"></span><span style="flex:1">${label}</span><b style="margin-left:16px">${kwh(value)}</b></div>`;

/**
 * Stacked bars: what the house used above the axis (self-consumed, then imported),
 * what it sold below (exported, as negative values).
 */
export const buildEnergyChartOptions = (
  buckets: DashboardBucket[],
  palette: ChartPalette,
  labels: ChartLabels,
): EChartsOption => {
  const splits: EnergySplit[] = buckets.map((b) => computeEnergySplit(b.entries));

  return {
    grid: { top: 10, left: 55, right: 20, bottom: 30, containLabel: false },
    xAxis: {
      type: 'category',
      data: buckets.map((b) => b.label),
      axisLabel: { fontSize: 11, color: palette.text },
      axisLine: { lineStyle: { color: palette.axis } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: palette.grid } },
      axisLabel: {
        fontSize: 11,
        color: palette.text,
        formatter: (value: number) => `${Math.abs(value)}`,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: palette.tooltip,
      borderColor: palette.grid,
      textStyle: { color: palette.text },
      formatter: (params: unknown) => {
        const index = (Array.isArray(params) ? params[0] : params) as { dataIndex: number };
        const bucket = buckets[index.dataIndex];
        const split = splits[index.dataIndex];
        if (!bucket || !split) {
          return '';
        }
        return [
          `<b>${bucket.title}</b>`,
          tooltipRow(palette.production, labels.produced, split.produced),
          tooltipRow(palette.consumption, labels.consumed, split.consumed),
          tooltipRow(palette.production, labels.selfConsumed, split.selfConsumed),
          tooltipRow(palette.export, labels.exported, split.exported),
          tooltipRow(palette.import, labels.imported, split.imported),
        ].join('');
      },
    },
    series: [
      {
        name: labels.selfConsumed,
        type: 'bar',
        stack: 'energy',
        data: splits.map((s) => s.selfConsumed),
        itemStyle: { color: palette.production },
      },
      {
        name: labels.imported,
        type: 'bar',
        stack: 'energy',
        data: splits.map((s) => s.imported),
        itemStyle: { color: palette.import, borderRadius: [5, 5, 0, 0] },
      },
      {
        name: labels.exported,
        type: 'bar',
        stack: 'energy',
        data: splits.map((s) => -s.exported),
        itemStyle: { color: palette.export, borderRadius: [0, 0, 5, 5] },
      },
    ],
  };
};

export const useDashboardChart = (buckets: DashboardBucket[]): EChartsOption => {
  const { t } = useTranslation();
  const theme = useDisplayedTheme();

  return useMemo(
    () =>
      buildEnergyChartOptions(
        buckets,
        { ...getEnergyColors(theme), ...getChartColors(theme) },
        {
          produced: t('home.chart.produced'),
          consumed: t('home.chart.consumed'),
          selfConsumed: t('home.chart.selfConsumed'),
          exported: t('home.chart.exported'),
          imported: t('home.chart.imported'),
        },
      ),
    [buckets, theme, t],
  );
};
