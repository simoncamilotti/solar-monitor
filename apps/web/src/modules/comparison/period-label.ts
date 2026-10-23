import { format, parseISO } from 'date-fns';
import type { Locale } from 'date-fns/locale';

import type { ComparisonPeriod } from './comparison.type.js';
import {
  isDayPeriod,
  isMonthPeriod,
  isRangePeriod,
  isYearPeriod,
} from './hooks/use-comparison-filters.hook.js';

/** `1 – 14 août 2025` within a month, `28 juil. – 3 août 2025` within a year. */
const formatRange = (start: string, end: string, locale: Locale): string => {
  const from = parseISO(start);
  const to = parseISO(end);
  const last = format(to, 'd MMM yyyy', { locale });
  if (start === end) return last;
  if (start.slice(0, 7) === end.slice(0, 7)) return `${format(from, 'd', { locale })} – ${last}`;
  if (start.slice(0, 4) === end.slice(0, 4)) {
    return `${format(from, 'd MMM', { locale })} – ${last}`;
  }
  return `${format(from, 'd MMM yyyy', { locale })} – ${last}`;
};

/** Name of a period in its chip, the legend and the summary: a range shows its name if it has one. */
export const getPeriodLabel = (
  period: ComparisonPeriod,
  monthName: (i: number) => string,
  locale: Locale,
): string => {
  if (isRangePeriod(period)) return period.name || formatRange(period.start, period.end, locale);
  if (isYearPeriod(period)) return `${period.year}`;
  if (isMonthPeriod(period)) return `${monthName(period.month)} ${period.year}`;
  if (isDayPeriod(period)) return period.date;
  return '';
};
