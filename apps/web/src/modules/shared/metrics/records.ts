import { addDays, format, parseISO } from 'date-fns';

import type { LifetimeDay } from '@repo/contracts';

/** A single day and its value, `date` as `yyyy-MM-dd`. */
type DayRecord = { date: string; value: number };

/** A calendar month and its value, `month` as `yyyy-MM`. */
type MonthRecord = { month: string; value: number };

/** Consecutive days, bounds included, as `yyyy-MM-dd`. */
export type Streak = { from: string; to: string; days: number };

export type Records = {
  bestDay: DayRecord;
  bestMonth: MonthRecord;
  /** Longest run of fully autonomous days, `null` when there is none. */
  longestStreak: Streak | null;
  /** Run of fully autonomous days ending on the last stored day, `null` when that day was not. */
  currentStreak: Streak | null;
  /** Month with the highest autonomy, `null` when no month has any consumption. */
  mostAutonomousMonth: MonthRecord | null;
  totalProduction: { since: string; value: number };
};

/** A day is fully autonomous when nothing was drawn from the grid. */
export const isAutonomousDay = (day: LifetimeDay): boolean => day.kwhImported === 0;

const nextDay = (date: string) => format(addDays(parseISO(date), 1), 'yyyy-MM-dd');

/** Keeps the first candidate on a tie: inputs are sorted by date, so the earliest wins. */
const maxBy = <T>(items: T[], value: (item: T) => number): T | undefined =>
  items.reduce<T | undefined>(
    (best, item) => (best === undefined || value(item) > value(best) ? item : best),
    undefined,
  );

type MonthTotals = { month: string; produced: number; consumed: number; imported: number };

const groupByMonth = (days: LifetimeDay[]): MonthTotals[] => {
  const months = new Map<string, MonthTotals>();
  for (const day of days) {
    const month = day.date.slice(0, 7);
    const totals = months.get(month) ?? { month, produced: 0, consumed: 0, imported: 0 };
    totals.produced += day.kwhProduced;
    totals.consumed += day.kwhConsumed;
    totals.imported += day.kwhImported;
    months.set(month, totals);
  }
  return [...months.values()];
};

/** Runs of autonomous days; a missing day ends a run like a day with imports does. */
const autonomousStreaks = (days: LifetimeDay[]): Streak[] => {
  const streaks: Streak[] = [];
  let current: Streak | null = null;

  for (const day of days) {
    if (!isAutonomousDay(day)) {
      current = null;
      continue;
    }
    if (current && nextDay(current.to) === day.date) {
      current.to = day.date;
      current.days += 1;
    } else {
      current = { from: day.date, to: day.date, days: 1 };
      streaks.push(current);
    }
  }
  return streaks;
};

/** Highlights of the whole history, or `null` when it is empty. */
export const computeRecords = (data: LifetimeDay[]): Records | null => {
  // `yyyy-MM-dd` strings sort lexicographically in chronological order.
  const days = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const months = groupByMonth(days);
  const first = days[0];
  const last = days[days.length - 1];
  const bestDay = maxBy(days, (d) => d.kwhProduced);
  const bestMonth = maxBy(months, (m) => m.produced);
  if (!first || !last || !bestDay || !bestMonth) {
    return null;
  }

  const consumingMonths = months.filter((m) => m.consumed > 0);
  const autonomy = (m: MonthTotals) => (1 - m.imported / m.consumed) * 100;
  const mostAutonomous = maxBy(consumingMonths, autonomy);

  const streaks = autonomousStreaks(days);
  const lastStreak = streaks[streaks.length - 1];

  return {
    bestDay: { date: bestDay.date, value: bestDay.kwhProduced },
    bestMonth: { month: bestMonth.month, value: bestMonth.produced },
    longestStreak: maxBy(streaks, (s) => s.days) ?? null,
    currentStreak: lastStreak && lastStreak.to === last.date ? lastStreak : null,
    mostAutonomousMonth: mostAutonomous
      ? { month: mostAutonomous.month, value: autonomy(mostAutonomous) }
      : null,
    totalProduction: { since: first.date, value: days.reduce((s, d) => s + d.kwhProduced, 0) },
  };
};
