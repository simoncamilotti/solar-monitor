import type { LifetimeDataResponseDto } from '@/shared-models';

export const getMonthsForYear = (data: LifetimeDataResponseDto, year: number): number[] => {
  return [...new Set(data.filter(d => new Date(d.date).getFullYear() === year).map(d => new Date(d.date).getMonth()))];
};
