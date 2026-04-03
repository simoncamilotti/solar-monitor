import type { LifetimeDataResponseDto } from '@/shared-models';

export const filterByYear = (data: LifetimeDataResponseDto, year: number) =>
  data.filter(d => new Date(d.date).getFullYear() === year);

export const filterByMonth = (data: LifetimeDataResponseDto, year: number, month: number) =>
  data.filter(d => {
    const date = new Date(d.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

export const filterByDay = (data: LifetimeDataResponseDto, dateStr: string) =>
  data.filter(d => {
    const date = new Date(d.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return key === dateStr;
  });
