import * as echarts from 'echarts/core';

import type { Theme } from '../../layout/theme.type.js';
import { getMetricColor } from '../../shared/metrics/energy-colors.js';
import type { CalendarLevel, CalendarMetric } from './calendar-data.js';

/**
 * Opacity of the metric's color for each level. A zero value keeps a faint tint, so that it never
 * reads like a missing day, which has no fill at all.
 */
const LEVEL_ALPHAS: Record<CalendarLevel, number> = { 0: 0.12, 1: 0.3, 2: 0.5, 3: 0.75, 4: 1 };

export const CALENDAR_LEVELS: CalendarLevel[] = [0, 1, 2, 3, 4];

export const levelColor = (metric: CalendarMetric, level: CalendarLevel, theme: Theme): string =>
  echarts.color.modifyAlpha(getMetricColor(metric, theme), LEVEL_ALPHAS[level]);
