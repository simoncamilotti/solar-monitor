import { useSyncExternalStore } from 'react';

import type { Theme } from '../../layout/theme.type.js';
import type { MetricKey } from './metric.type.js';

/** One colour per energy flow, the same on every page. */
export type EnergyColors = {
  production: string;
  consumption: string;
  import: string;
  export: string;
};

/** Single source of the colours of the data: cards, charts, comparison and history. */
const ENERGY_COLORS: Record<Theme, EnergyColors> = {
  light: { production: '#f59e0b', consumption: '#3b82f6', import: '#94a3b8', export: '#10b981' },
  dark: { production: '#fbbf24', consumption: '#60a5fa', import: '#64748b', export: '#34d399' },
};

/** Colours of the compared periods, in order: the four flows' hues, then a neutral stone. */
const PERIOD_COLORS: Record<Theme, string[]> = {
  light: ['#f59e0b', '#3b82f6', '#10b981', '#78716c'],
  dark: ['#fbbf24', '#60a5fa', '#34d399', '#a8a29e'],
};

/** Colours of the chart chrome, so ECharts follows the theme like the rest of the page. */
const CHART_COLORS: Record<Theme, { text: string; axis: string; grid: string; tooltip: string }> = {
  light: { text: '#6b645d', axis: '#a8a29e', grid: '#e7e2d8', tooltip: '#ffffff' },
  dark: { text: '#a8a29e', axis: '#57514a', grid: '#2c2721', tooltip: '#1a1713' },
};

const METRIC_FLOW: Record<MetricKey, keyof EnergyColors> = {
  kwhProduced: 'production',
  kwhConsumed: 'consumption',
  kwhImported: 'import',
  kwhExported: 'export',
  autonomy: 'production',
  selfConsumption: 'export',
  gridDependency: 'import',
};

export const getEnergyColors = (theme: Theme): EnergyColors => ENERGY_COLORS[theme];

export const getMetricColor = (metric: MetricKey, theme: Theme): string =>
  ENERGY_COLORS[theme][METRIC_FLOW[metric]];

/** Colour of the compared period at `index`: the palette repeats once exhausted. */
export const getPeriodColor = (index: number, theme: Theme): string => {
  const colors = PERIOD_COLORS[theme];
  return colors[index % colors.length] ?? ENERGY_COLORS[theme].production;
};

export const getChartColors = (theme: Theme) => CHART_COLORS[theme];

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
};

const readTheme = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

/** Theme shown on the page, read from the `dark` class the theme provider sets on `<html>`. */
export const useDisplayedTheme = (): Theme => useSyncExternalStore(subscribe, readTheme);
