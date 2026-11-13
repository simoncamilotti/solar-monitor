import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';

import type { LifetimeDay, Tariff } from '@repo/contracts';

import { priceOn } from './savings-computation.js';

/** A yearly billing period, both bounds included, named by the year it starts in. */
export type BillingPeriod = {
  year: number;
  start: string;
  end: string;
  totalDays: number;
};

/** Days of history averaged to project the rest of a period: a whole year, so seasons cancel out. */
const PACE_WINDOW_DAYS = 365;

/** Below this many stored days, the pace says nothing: no estimate. */
const MIN_HISTORY_DAYS = 30;

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const toDay = (date: Date): string => format(date, 'yyyy-MM-dd');

/** The day the billing year starts on in `year`; 29 February falls on the 28th in common years. */
export const anniversaryIn = (billingStart: string, year: number): string => {
  const monthAndDay = billingStart.slice(5);
  const normalized = monthAndDay === '02-29' && !isLeapYear(year) ? '02-28' : monthAndDay;
  return `${String(year).padStart(4, '0')}-${normalized}`;
};

/** Always computed from the original start, never from the previous period, so nothing drifts. */
export const billingPeriodOf = (billingStart: string, year: number): BillingPeriod => {
  const start = anniversaryIn(billingStart, year);
  const end = toDay(addDays(parseISO(anniversaryIn(billingStart, year + 1)), -1));
  return {
    year,
    start,
    end,
    totalDays: differenceInCalendarDays(parseISO(end), parseISO(start)) + 1,
  };
};

/** Year of the billing period a day belongs to; may precede the first period of the contract. */
const periodYearOf = (billingStart: string, day: string): number => {
  const year = Number(day.slice(0, 4));
  return day >= anniversaryIn(billingStart, year) ? year : year - 1;
};

/** Year of the period `today` is in, or `null` while the first period has not started. */
export const currentBillingYear = (billingStart: string, today: string): number | null =>
  today < billingStart ? null : periodYearOf(billingStart, today);

/**
 * Year of the oldest period worth showing: the first one holding a stored day, and never one
 * before the billing start.
 */
export const oldestBillingYear = (
  billingStart: string,
  days: LifetimeDay[],
  currentYear: number,
): number => {
  const firstDay = days.reduce<string | null>(
    (first, { date }) => (first === null || date < first ? date : first),
    null,
  );
  if (firstDay === null) return currentYear;
  const firstPeriodYear = Number(billingStart.slice(0, 4));
  return Math.min(currentYear, Math.max(firstPeriodYear, periodYearOf(billingStart, firstDay)));
};

type ResaleEstimate = {
  /** Acquired amount plus the projection of the days still to come. */
  amount: number;
  /** Where the pace comes from: the same days of the previous period, or the last year stored. */
  basis: 'previousPeriod' | 'lastYear';
};

export type PeriodResale = {
  period: BillingPeriod;
  isCurrent: boolean;
  /** Exported energy of the stored days, at the feed-in price in force each day. */
  acquired: number;
  /** Days that have passed in the period and are not stored: not valued, not counted as zero. */
  missingDays: number;
  /** Stored days with no feed-in tariff in force yet. */
  unpricedDays: number;
  /** Current period only: days gone by, then days left today included. */
  elapsedDays: number;
  remainingDays: number;
  /** Current period only; `null` without enough history. */
  estimate: ResaleEstimate | null;
};

const projectFromPreviousPeriod = (
  byDate: Map<string, LifetimeDay>,
  tariffs: Tariff[],
  billingStart: string,
  period: BillingPeriod,
  elapsedDays: number,
): number | null => {
  if (period.year - 1 < Number(billingStart.slice(0, 4))) return null;
  const previous = billingPeriodOf(billingStart, period.year - 1);
  let projected = 0;
  for (let index = elapsedDays; index < period.totalDays; index += 1) {
    // A leap year gives the period one more day than the previous one: it reuses the last.
    const source = byDate.get(
      toDay(addDays(parseISO(previous.start), Math.min(index, previous.totalDays - 1))),
    );
    if (!source) return null;
    const price = priceOn(tariffs, 'feedIn', toDay(addDays(parseISO(period.start), index)));
    if (price !== null) projected += source.kwhExported * price;
  }
  return projected;
};

const projectFromLastYear = (
  days: LifetimeDay[],
  tariffs: Tariff[],
  period: BillingPeriod,
  elapsedDays: number,
): number | null => {
  if (days.length < MIN_HISTORY_DAYS) return null;
  const recent = [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(-PACE_WINDOW_DAYS);
  const dailyKwh = recent.reduce((sum, day) => sum + day.kwhExported, 0) / recent.length;
  let projected = 0;
  for (let index = elapsedDays; index < period.totalDays; index += 1) {
    const price = priceOn(tariffs, 'feedIn', toDay(addDays(parseISO(period.start), index)));
    if (price !== null) projected += dailyKwh * price;
  }
  return projected;
};

/**
 * What the surplus resale of one billing period amounts to. A finished period is final; the
 * current one adds an estimate of the days to come. `today` is a parameter, never read here.
 */
export const computePeriodResale = (
  days: LifetimeDay[],
  tariffs: Tariff[],
  billingStart: string,
  year: number,
  today: string,
): PeriodResale => {
  const period = billingPeriodOf(billingStart, year);
  const isCurrent = period.start <= today && today <= period.end;
  const byDate = new Map(days.map((day) => [day.date, day]));

  // Today is never stored yet: the last day counted is yesterday, or the end of a past period.
  const yesterday = toDay(addDays(parseISO(today), -1));
  const lastCounted = period.end < yesterday ? period.end : yesterday;

  let acquired = 0;
  let missingDays = 0;
  let unpricedDays = 0;
  for (let day = period.start; day <= lastCounted; day = toDay(addDays(parseISO(day), 1))) {
    const stored = byDate.get(day);
    if (!stored) {
      missingDays += 1;
      continue;
    }
    const price = priceOn(tariffs, 'feedIn', day);
    if (price === null) unpricedDays += 1;
    else acquired += stored.kwhExported * price;
  }

  if (!isCurrent) {
    return {
      period,
      isCurrent,
      acquired,
      missingDays,
      unpricedDays,
      elapsedDays: period.totalDays,
      remainingDays: 0,
      estimate: null,
    };
  }

  const elapsedDays = differenceInCalendarDays(parseISO(today), parseISO(period.start));
  const fromPrevious = projectFromPreviousPeriod(
    byDate,
    tariffs,
    billingStart,
    period,
    elapsedDays,
  );
  const fromLastYear =
    fromPrevious === null ? projectFromLastYear(days, tariffs, period, elapsedDays) : null;

  let estimate: ResaleEstimate | null = null;
  if (fromPrevious !== null) {
    estimate = { amount: acquired + fromPrevious, basis: 'previousPeriod' };
  } else if (fromLastYear !== null) {
    estimate = { amount: acquired + fromLastYear, basis: 'lastYear' };
  }

  return {
    period,
    isCurrent,
    acquired,
    missingDays,
    unpricedDays,
    elapsedDays,
    remainingDays: period.totalDays - elapsedDays,
    estimate,
  };
};
