import {
  getRangeResolutions,
  lastsTwoMonths,
  periodJustBefore,
  rangeLength,
  sameDatesPreviousYear,
} from './comparison-ranges.js';

describe('comparison ranges', () => {
  it('should count both bounds in the length of a range', () => {
    expect(rangeLength({ start: '2025-08-01', end: '2025-08-14' })).toBe(14);
    expect(rangeLength({ start: '2025-08-01', end: '2025-08-01' })).toBe(1);
  });

  it('should tell whether a range covers two months', () => {
    expect(lastsTwoMonths({ start: '2025-03-01', end: '2025-04-30' })).toBe(true);
    expect(lastsTwoMonths({ start: '2025-03-01', end: '2025-04-29' })).toBe(false);
  });

  it('should offer the monthly grouping only when every range lasts two months', () => {
    const long = { start: '2025-01-01', end: '2025-06-30' };
    const short = { start: '2025-08-01', end: '2025-08-14' };

    expect(getRangeResolutions([long])).toEqual(['daily', 'weekly', 'monthly']);
    expect(getRangeResolutions([long, short])).toEqual(['daily', 'weekly']);
    expect(getRangeResolutions([])).toEqual(['daily', 'weekly']);
  });

  it('should shift a range to the same dates one year earlier', () => {
    expect(sameDatesPreviousYear({ start: '2025-08-01', end: '2025-08-14', name: 'Été' })).toEqual({
      start: '2024-08-01',
      end: '2024-08-14',
    });
    expect(sameDatesPreviousYear({ start: '2024-02-29', end: '2024-03-10' })).toEqual({
      start: '2023-02-28',
      end: '2023-03-10',
    });
  });

  it('should give the range of the same length just before', () => {
    expect(periodJustBefore({ start: '2025-08-01', end: '2025-08-14' })).toEqual({
      start: '2025-07-18',
      end: '2025-07-31',
    });
  });
});
