import type { LifetimeDay } from '@repo/contracts';

import { summarizePeriods } from './comparison-summary.js';

const entry = (
  date: string,
  kwhProduced: number,
  kwhConsumed = 10,
  kwhImported = 0,
): LifetimeDay => ({
  date,
  kwhProduced,
  kwhConsumed,
  kwhImported,
  kwhExported: 0,
  gridDependency: 0,
});

const DATA = [
  entry('2025-08-01', 10),
  entry('2025-08-02', 30),
  entry('2024-08-01', 20, 10, 5),
  entry('2024-08-02', 30, 10, 2),
];

describe('summarizePeriods', () => {
  it('should give the total, the daily average and the best day of each period', () => {
    const [summary] = summarizePeriods(
      DATA,
      [{ start: '2025-08-01', end: '2025-08-02' }],
      'kwhProduced',
    );

    expect(summary).toEqual({
      total: 40,
      dailyAverage: 20,
      bestDay: { date: '2025-08-02', value: 30 },
      change: null,
    });
  });

  it('should compare each period with the first one, in percent for an energy', () => {
    const summaries = summarizePeriods(
      DATA,
      [
        { start: '2025-08-01', end: '2025-08-02' },
        { start: '2024-08-01', end: '2024-08-02' },
      ],
      'kwhProduced',
    );

    expect(summaries[1]!.change).toBeCloseTo(25);
  });

  it('should compare percentages in points, without a daily average', () => {
    const summaries = summarizePeriods(DATA, [{ year: 2025 }, { year: 2024 }], 'autonomy');

    expect(summaries[0]!.total).toBe(100);
    expect(summaries[1]!.total).toBeCloseTo(65);
    expect(summaries[1]!.change).toBeCloseTo(-35);
    expect(summaries[1]!.dailyAverage).toBeNull();
  });

  it('should pick the lowest day when a lower value is better', () => {
    const [, summary] = summarizePeriods(DATA, [{ year: 2025 }, { year: 2024 }], 'kwhImported');

    expect(summary!.bestDay).toEqual({ date: '2024-08-02', value: 2 });
  });
});
