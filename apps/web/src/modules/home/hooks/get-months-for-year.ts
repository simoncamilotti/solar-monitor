import { parseISO } from 'date-fns';

import type { LifetimeDay } from '@repo/contracts';

export const getMonthsForYear = (data: LifetimeDay[], year: number): number[] => {
  return [
    ...new Set(
      data
        .filter((d) => parseISO(d.date).getFullYear() === year)
        .map((d) => parseISO(d.date).getMonth()),
    ),
  ];
};
