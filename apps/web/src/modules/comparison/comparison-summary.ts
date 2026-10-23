import type { LifetimeDay } from '@repo/contracts';

import { filterByDay, filterByMonth, filterByRange, filterByYear } from '../shared/data/index.js';
import { computeMetric, getMetricUnit } from '../shared/metrics/index.js';
import type { MetricKey } from '../shared/metrics/metric.type.js';
import type { ComparisonPeriod } from './comparison.type.js';
import {
  isDayPeriod,
  isMonthPeriod,
  isRangePeriod,
  isYearPeriod,
} from './hooks/use-comparison-filters.hook.js';

/** Metrics where a lower value is the better day. */
const LOWER_IS_BETTER: MetricKey[] = ['kwhConsumed', 'kwhImported', 'gridDependency'];

export type PeriodSummary = {
  /** Sum for an energy, ratio over the whole period for a percentage. */
  total: number;
  /** `null` for a percentage: a mean of daily ratios would not match the total. */
  dailyAverage: number | null;
  bestDay: { date: string; value: number } | null;
  /** Relative change in % for an energy, difference in points for a percentage; `null` for the first period. */
  change: number | null;
};

const getPeriodEntries = (data: LifetimeDay[], period: ComparisonPeriod): LifetimeDay[] => {
  if (isRangePeriod(period)) return filterByRange(data, period.start, period.end);
  if (isDayPeriod(period)) return filterByDay(data, period.date);
  if (isMonthPeriod(period)) return filterByMonth(data, period.year, period.month);
  if (isYearPeriod(period)) return filterByYear(data, period.year);
  return [];
};

const findBestDay = (entries: LifetimeDay[], metric: MetricKey): PeriodSummary['bestDay'] => {
  const sign = LOWER_IS_BETTER.includes(metric) ? -1 : 1;
  let best: PeriodSummary['bestDay'] = null;
  for (const entry of entries) {
    const value = computeMetric(metric, [entry]);
    if (best === null || sign * value > sign * best.value) {
      best = { date: entry.date, value };
    }
  }
  return best;
};

/** Total, daily average and best day of each period, compared with the first one. */
export const summarizePeriods = (
  data: LifetimeDay[],
  periods: ComparisonPeriod[],
  metric: MetricKey,
): PeriodSummary[] => {
  const isPercentage = getMetricUnit(metric) === '%';
  const totals = periods.map((p) => computeMetric(metric, getPeriodEntries(data, p)));
  const reference = totals[0] ?? 0;

  return periods.map((period, index) => {
    const entries = getPeriodEntries(data, period);
    const total = totals[index] ?? 0;
    let change: number | null = null;
    if (index > 0) {
      if (isPercentage) change = total - reference;
      else if (reference !== 0) change = ((total - reference) / reference) * 100;
    }

    return {
      total,
      dailyAverage: isPercentage || entries.length === 0 ? null : total / entries.length,
      bestDay: findBestDay(entries, metric),
      change,
    };
  });
};
