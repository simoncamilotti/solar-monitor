import { parseISO } from 'date-fns';

import type { LifetimeDay } from '@repo/contracts';

import type { ComparisonGranularity, ComparisonPeriod } from './comparison.type.js';

/** At most four periods side by side: beyond that, the bars of a group are unreadable. */
export const MAX_COMPARISON_PERIODS = 4;

type ComparisonPresetId =
  'thisYearVsLastYear' | 'thisMonthVsLastYear' | 'bestAndWorstYear' | 'recentYears';

export type ComparisonPreset = {
  id: ComparisonPresetId;
  granularity: ComparisonGranularity;
  /** `null` when the history is too short for this comparison. */
  periods: ComparisonPeriod[] | null;
};

const productionByYear = (data: LifetimeDay[]): Map<number, number> => {
  const totals = new Map<number, number>();
  for (const d of data) {
    const year = parseISO(d.date).getFullYear();
    totals.set(year, (totals.get(year) ?? 0) + d.kwhProduced);
  }
  return totals;
};

/** The ready-made comparisons offered on the empty compare page, from the stored history. */
export const getComparisonPresets = (data: LifetimeDay[]): ComparisonPreset[] => {
  const totals = productionByYear(data);
  const years = [...totals.keys()].sort((a, b) => a - b);
  const lastYear = years.at(-1);

  const lastDay = data.reduce<string | null>(
    (max, d) => (max === null || d.date > max ? d.date : max),
    null,
  );
  const lastMonth = lastDay ? parseISO(lastDay) : null;
  const hasMonth = (year: number, month: number) =>
    data.some((d) => {
      const date = parseISO(d.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });

  const byProduction = [...totals.entries()].sort(([, a], [, b]) => b - a);
  const best = byProduction[0]?.[0];
  const worst = byProduction.at(-1)?.[0];

  return [
    {
      id: 'thisYearVsLastYear',
      granularity: 'years',
      periods:
        lastYear !== undefined && totals.has(lastYear - 1)
          ? [{ year: lastYear }, { year: lastYear - 1 }]
          : null,
    },
    {
      id: 'thisMonthVsLastYear',
      granularity: 'months',
      periods:
        lastMonth && hasMonth(lastMonth.getFullYear() - 1, lastMonth.getMonth())
          ? [
              { year: lastMonth.getFullYear(), month: lastMonth.getMonth() },
              { year: lastMonth.getFullYear() - 1, month: lastMonth.getMonth() },
            ]
          : null,
    },
    {
      id: 'bestAndWorstYear',
      granularity: 'years',
      periods:
        best !== undefined && worst !== undefined && best !== worst
          ? [{ year: best }, { year: worst }]
          : null,
    },
    {
      id: 'recentYears',
      granularity: 'years',
      periods:
        years.length >= 2
          ? years
              .slice(-MAX_COMPARISON_PERIODS)
              .reverse()
              .map((year) => ({ year }))
          : null,
    },
  ];
};
