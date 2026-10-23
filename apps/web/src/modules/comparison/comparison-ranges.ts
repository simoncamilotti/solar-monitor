import { addDays, addMonths, differenceInCalendarDays, format, parseISO, subYears } from 'date-fns';

import type { LifetimeDay } from '@repo/contracts';

import { filterByRange } from '../shared/data/index.js';
import { computeMetric } from '../shared/metrics/index.js';
import type { MetricKey } from '../shared/metrics/metric.type.js';
import type { ComparisonResolution, RangePeriod } from './comparison.type.js';

const toIso = (date: Date): string => format(date, 'yyyy-MM-dd');

/** Number of days of a range, both bounds included. */
export const rangeLength = ({ start, end }: RangePeriod): number =>
  differenceInCalendarDays(parseISO(end), parseISO(start)) + 1;

/** Whether a range covers at least two calendar months: 1 March → 30 April does. */
export const lastsTwoMonths = ({ start, end }: RangePeriod): boolean =>
  differenceInCalendarDays(parseISO(end), addDays(addMonths(parseISO(start), 2), -1)) >= 0;

/** The groupings offered for ranges: by month only when every range lasts two months. */
export const getRangeResolutions = (periods: RangePeriod[]): ComparisonResolution[] =>
  periods.length > 0 && periods.every(lastsTwoMonths)
    ? ['daily', 'weekly', 'monthly']
    : ['daily', 'weekly'];

/** The same dates one year earlier: 29 February falls back to the 28th. */
export const sameDatesPreviousYear = ({ start, end }: RangePeriod): RangePeriod => ({
  start: toIso(subYears(parseISO(start), 1)),
  end: toIso(subYears(parseISO(end), 1)),
});

/** The range of the same length that ends the day before `period` starts. */
export const periodJustBefore = (period: RangePeriod): RangePeriod => {
  const start = parseISO(period.start);
  return {
    start: toIso(addDays(start, -rangeLength(period))),
    end: toIso(addDays(start, -1)),
  };
};

type Bucket = { start: string; end: string };

/** Consecutive buckets of a range, from its first day: the last one may be cut short. */
const rangeBuckets = (period: RangePeriod, resolution: ComparisonResolution): Bucket[] => {
  const first = parseISO(period.start);
  const last = parseISO(period.end);
  const step = (date: Date, n: number) =>
    resolution === 'monthly'
      ? addMonths(date, n)
      : addDays(date, resolution === 'weekly' ? 7 * n : n);

  const buckets: Bucket[] = [];
  for (let i = 0; differenceInCalendarDays(last, step(first, i)) >= 0; i++) {
    const bucketEnd = addDays(step(first, i + 1), -1);
    buckets.push({
      start: toIso(step(first, i)),
      end: toIso(differenceInCalendarDays(bucketEnd, last) > 0 ? last : bucketEnd),
    });
  }
  return buckets;
};

/**
 * Values of each range on a shared axis aligned on their first day (D1, W1 or M1), as long as
 * the longest range: the shorter ones end with `null`.
 */
export const alignRanges = (
  data: LifetimeDay[],
  periods: RangePeriod[],
  metric: MetricKey,
  resolution: ComparisonResolution,
): { length: number; values: (number | null)[][] } => {
  const buckets = periods.map((p) => rangeBuckets(p, resolution));
  const length = Math.max(0, ...buckets.map((b) => b.length));

  return {
    length,
    values: buckets.map((periodBuckets) =>
      Array.from({ length }, (_, i) => {
        const bucket = periodBuckets[i];
        return bucket ? computeMetric(metric, filterByRange(data, bucket.start, bucket.end)) : null;
      }),
    ),
  };
};
