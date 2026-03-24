import { format } from 'date-fns';

import type { LifetimeDataResponseDto } from '@/shared-models';

export const getDaysForMonth = (data: LifetimeDataResponseDto, year: number, month: number): string[] => {
  return data
    .filter(d => {
      const date = new Date(d.date);
      return date.getFullYear() === year && date.getMonth() === month;
    })
    .map(d => format(new Date(d.date), 'yyyy-MM-dd'))
    .sort();
};
