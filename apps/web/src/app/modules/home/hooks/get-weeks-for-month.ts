import type { Locale } from 'date-fns';
import { eachWeekOfInterval, endOfMonth, endOfWeek, format, isWithinInterval, startOfMonth } from 'date-fns';

import type { LifetimeDataResponseDto } from '@/shared-models';

import type { WeekRange } from '../dashboard.type';

export const getWeeksForMonth = (
  data: LifetimeDataResponseDto,
  year: number,
  month: number,
  locale: Locale,
): WeekRange[] => {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  const weekStarts = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

  return weekStarts
    .map(ws => {
      const we = endOfWeek(ws, { weekStartsOn: 1 });
      const label = `${format(ws, 'EEE d', { locale })} - ${format(we, 'EEE d', { locale })}`;
      return { start: ws, end: we, label };
    })
    .filter(week => data.some(d => isWithinInterval(new Date(d.date), { start: week.start, end: week.end })));
};
