import { parseISO } from 'date-fns';

import type { LifetimeDay } from '@repo/contracts';

// `d.date` is a plain calendar date ("yyyy-MM-dd"), not a point in time. `parseISO` reads a
// date-only string as local midnight, so the getters below always agree with the string —
// `new Date(d.date)` would parse it as UTC midnight instead, shifting by a day west of Greenwich.
export const filterByYear = (data: LifetimeDay[], year: number) =>
  data.filter((d) => parseISO(d.date).getFullYear() === year);

export const filterByMonth = (data: LifetimeDay[], year: number, month: number) =>
  data.filter((d) => {
    const date = parseISO(d.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

export const filterByDay = (data: LifetimeDay[], dateStr: string) =>
  data.filter((d) => d.date === dateStr);
