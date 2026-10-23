import type { LifetimeDay } from '@repo/contracts';

import { buildCalendarYear, calendarYears, dayValue, levelOf } from './calendar-data.js';

const day = (
  date: string,
  kwhProduced: number,
  kwhConsumed = 10,
  kwhImported = 4,
): LifetimeDay => ({
  date,
  kwhProduced,
  kwhConsumed,
  kwhImported,
  kwhExported: 0,
  gridDependency: 0,
});

describe('dayValue', () => {
  it('should read an energy as stored', () => {
    expect(dayValue(day('2024-05-01', 12), 'kwhProduced')).toBe(12);
    expect(dayValue(day('2024-05-01', 12), 'kwhConsumed')).toBe(10);
  });

  it('should compute the autonomy of the day', () => {
    expect(dayValue(day('2024-05-01', 12, 10, 4), 'autonomy')).toBeCloseTo(60);
  });

  it('should have no autonomy on a day without consumption', () => {
    expect(dayValue(day('2024-05-01', 12, 0, 0), 'autonomy')).toBeNull();
  });
});

describe('levelOf', () => {
  it('should keep zero apart from the lowest quarter', () => {
    expect(levelOf(0, 20)).toBe(0);
    expect(levelOf(0.1, 20)).toBe(1);
  });

  it('should split the scale in quarters', () => {
    expect(levelOf(5, 20)).toBe(1);
    expect(levelOf(6, 20)).toBe(2);
    expect(levelOf(15, 20)).toBe(3);
    expect(levelOf(20, 20)).toBe(4);
  });
});

describe('calendarYears', () => {
  it('should list the years of the history, ascending', () => {
    expect(
      calendarYears([day('2025-01-01', 1), day('2023-06-01', 1), day('2025-02-01', 1)]),
    ).toEqual([2023, 2025]);
  });
});

describe('buildCalendarYear', () => {
  it('should mark a day missing inside the stored range, and keep a zero day as a value', () => {
    const { cells } = buildCalendarYear(
      [day('2024-03-01', 8), day('2024-03-03', 0)],
      2024,
      'kwhProduced',
    );

    expect(cells).toEqual([
      { date: '2024-03-01', kind: 'value', value: 8, level: 4 },
      { date: '2024-03-02', kind: 'missing' },
      { date: '2024-03-03', kind: 'value', value: 0, level: 0 },
    ]);
  });

  it('should leave out the days before the first and after the last stored day', () => {
    const { cells } = buildCalendarYear(
      [day('2024-12-30', 5), day('2025-01-02', 5)],
      2024,
      'kwhProduced',
    );

    expect(cells.map((c) => c.date)).toEqual(['2024-12-30', '2024-12-31']);
    expect(cells[1]).toEqual({ date: '2024-12-31', kind: 'missing' });
  });

  it('should scale on the highest value of the chosen year only', () => {
    const { max, cells } = buildCalendarYear(
      [day('2023-07-01', 40), day('2024-07-01', 20), day('2024-07-02', 10)],
      2024,
      'kwhProduced',
    );

    expect(max).toBe(20);
    expect(cells.filter((c) => c.kind === 'value').map((c) => c.level)).toEqual([4, 2]);
  });

  it('should scale the autonomy from 0 to 100 %', () => {
    const { max, cells } = buildCalendarYear([day('2024-07-01', 10, 10, 5)], 2024, 'autonomy');

    expect(max).toBe(100);
    expect(cells[0]).toMatchObject({ kind: 'value', level: 2 });
  });

  it('should give no cell to a stored day without a value', () => {
    const { cells } = buildCalendarYear([day('2024-07-01', 10, 0, 0)], 2024, 'autonomy');

    expect(cells).toEqual([]);
  });

  it('should return no cell for an empty history', () => {
    expect(buildCalendarYear([], 2024, 'kwhProduced')).toEqual({ cells: [], max: 0 });
  });
});
