import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type EnergyScale,
  energyScale,
  formatAxisValue,
  formatScaled,
} from '../../shared/format/index.js';
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

const tooltipRow = (color: string, label: string, value: string) =>
  `<div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:2px;background:${color}"></span><span style="flex:1">${label}</span><b style="margin-left:16px">${value}</b></div>`;

/**
 * Grouped bars, one series per flow, so none hides another. The legend toggles each series and
 * the value axis follows.
 */
export const buildEnergyChartOptions = (
  buckets: DashboardBucket[],
  palette: ChartPalette,
  labels: ChartLabels,
  language: string,
): EChartsOption => {
  const splits: EnergySplit[] = buckets.map((b) => computeEnergySplit(b.entries));
  const scale: EnergyScale = energyScale(splits.flatMap((s) => [s.produced, s.consumed]));
  const energy = (kwh: number) => formatScaled(kwh, scale, language);
  // Self-consumed is a share of the production: same hue, lighter.
  const selfConsumedColor = echarts.color.modifyAlpha(palette.production, 0.45);
  const flows = [
    { name: labels.produced, color: palette.production, values: splits.map((s) => s.produced) },
    { name: labels.consumed, color: palette.consumption, values: splits.map((s) => s.consumed) },
    {
      name: labels.selfConsumed,
      color: selfConsumedColor,
      values: splits.map((s) => s.selfConsumed),
    },
    { name: labels.imported, color: palette.import, values: splits.map((s) => s.imported) },
    { name: labels.exported, color: palette.export, values: splits.map((s) => s.exported) },
  ];

  return {
    grid: { top: 40, left: 55, right: 20, bottom: 30, containLabel: false },
    legend: {
      top: 0,
      data: flows.map((f) => ({ name: f.name, itemStyle: { color: f.color } })),
      textStyle: { fontSize: 11, color: palette.text },
      inactiveColor: palette.axis,
    },
    xAxis: {
      type: 'category',
      data: buckets.map((b) => b.label),
      axisLabel: { fontSize: 11, color: palette.text },
      axisLine: { lineStyle: { color: palette.axis } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: scale.unit,
      nameTextStyle: { fontSize: 11, color: palette.text, align: 'right' },
      splitLine: { lineStyle: { type: 'dashed', color: palette.grid } },
      axisLabel: {
        fontSize: 11,
        color: palette.text,
        formatter: (value: number) => formatAxisValue(value, scale, language),
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
          tooltipRow(palette.production, labels.produced, energy(split.produced)),
          tooltipRow(palette.consumption, labels.consumed, energy(split.consumed)),
          tooltipRow(selfConsumedColor, labels.selfConsumed, energy(split.selfConsumed)),
          tooltipRow(palette.export, labels.exported, energy(split.exported)),
          tooltipRow(palette.import, labels.imported, energy(split.imported)),
        ].join('');
      },
    },
    series: flows.map((f) => ({
      name: f.name,
      type: 'bar',
      data: f.values,
      itemStyle: { color: f.color, borderRadius: [3, 3, 0, 0] },
      barGap: '10%',
      barCategoryGap: '25%',
    })),
  };
};

export const useDashboardChart = (buckets: DashboardBucket[]): EChartsOption => {
  const { t, i18n } = useTranslation();
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
        i18n.language,
      ),
    [buckets, theme, t, i18n.language],
  );
};
