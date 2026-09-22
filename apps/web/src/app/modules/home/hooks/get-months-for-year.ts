import { parseISO } from 'date-fns';

import type { LifetimeDataResponseDto } from '@/shared-models';

export const getMonthsForYear = (data: LifetimeDataResponseDto, year: number): number[] => {
  return [...new Set(data.filter(d => parseISO(d.date).getFullYear() === year).map(d => parseISO(d.date).getMonth()))];
};
