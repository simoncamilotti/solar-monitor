import { addDays, format, parseISO } from 'date-fns';

import type { LifetimeDay } from '@repo/contracts';

export type CalendarMetric = 'kwhProduced' | 'kwhConsumed' | 'autonomy';

export const CALENDAR_METRICS: CalendarMetric[] = ['kwhProduced', 'kwhConsumed', 'autonomy'];

/** Intensity of a day on the year's scale: 0 for a zero value, 1 to 4 from the lowest to the top quarter. */
export type CalendarLevel = 0 | 1 | 2 | 3 | 4;

type CalendarCell =
  | { date: string; kind: 'value'; value: number; level: CalendarLevel }
  /** A day between the first and the last stored days that the history lacks. */
  | { date: string; kind: 'missing' };

export type CalendarYear = {
  cells: CalendarCell[];
  /** Top of the scale: the year's highest value, or 100 for a percentage. */
  max: number;
};

/** Autonomy is undefined on a day without consumption: such a day has no value. */
export const dayValue = (day: LifetimeDay, metric: CalendarMetric): number | null => {
  if (metric !== 'autonomy') {
    return day[metric];
  }
  return day.kwhConsumed > 0 ? (1 - day.kwhImported / day.kwhConsumed) * 100 : null;
};

export const levelOf = (value: number, max: number): CalendarLevel => {
  if (value <= 0 || max <= 0) {
    return 0;
  }
  return Math.min(4, Math.max(1, Math.ceil((value / max) * 4))) as CalendarLevel;
};

/** Years present in the history, ascending. */
export const calendarYears = (data: LifetimeDay[]): number[] =>
  [...new Set(data.map((d) => Number(d.date.slice(0, 4))))].sort((a, b) => a - b);

/**
 * One cell per stored day of the year, plus one per missing day inside the stored range.
 * Days before the first stored day or after the last one are left out: they are not missing,
 * the installation simply was not followed yet, or the day has not come.
 */
export const buildCalendarYear = (
  data: LifetimeDay[],
  year: number,
  metric: CalendarMetric,
): CalendarYear => {
  // `yyyy-MM-dd` strings sort in chronological order.
  const dates = data.map((d) => d.date).sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  const byDate = new Map(data.map((d) => [d.date, d]));
  const prefix = `${year}-`;

  const values = new Map<string, number>();
  for (const day of data) {
    if (day.date.startsWith(prefix)) {
      const value = dayValue(day, metric);
      if (value !== null) {
        values.set(day.date, value);
      }
    }
  }

  const max = metric === 'autonomy' ? 100 : Math.max(0, ...values.values());

  const cells: CalendarCell[] = [];
  if (first === undefined || last === undefined) {
    return { cells, max };
  }

  const start = first > `${year}-01-01` ? first : `${year}-01-01`;
  const end = last < `${year}-12-31` ? last : `${year}-12-31`;
  for (let date = start; date <= end; date = format(addDays(parseISO(date), 1), 'yyyy-MM-dd')) {
    const value = values.get(date);
    if (value !== undefined) {
      cells.push({ date, kind: 'value', value, level: levelOf(value, max) });
    } else if (!byDate.has(date)) {
      cells.push({ date, kind: 'missing' });
    }
  }

  return { cells, max };
};
