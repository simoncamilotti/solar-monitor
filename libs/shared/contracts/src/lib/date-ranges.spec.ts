import { dateRangeCreateSchema, dateRangeUpdateSchema } from './date-ranges.js';

describe('dateRangeCreateSchema', () => {
  const valid = { name: 'Été 2024', startDate: '2024-06-21', endDate: '2024-09-22' };

  it('should accept a named range, a single day included', () => {
    expect(dateRangeCreateSchema.safeParse(valid).success).toBe(true);
    expect(dateRangeCreateSchema.safeParse({ ...valid, endDate: valid.startDate }).success).toBe(
      true,
    );
  });

  it('should trim the name and reject an empty one', () => {
    expect(dateRangeCreateSchema.parse({ ...valid, name: '  Été 2024 ' }).name).toBe('Été 2024');
    expect(dateRangeCreateSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false);
  });

  it('should reject a start after the end or a day that does not exist', () => {
    expect(dateRangeCreateSchema.safeParse({ ...valid, endDate: '2024-06-20' }).success).toBe(
      false,
    );
    expect(dateRangeCreateSchema.safeParse({ ...valid, startDate: '2024-02-30' }).success).toBe(
      false,
    );
  });
});

describe('dateRangeUpdateSchema', () => {
  it('should accept a rename alone', () => {
    expect(dateRangeUpdateSchema.safeParse({ name: 'Vacances' }).success).toBe(true);
  });

  it('should reject a start after the end when both are sent', () => {
    expect(
      dateRangeUpdateSchema.safeParse({ startDate: '2024-07-02', endDate: '2024-07-01' }).success,
    ).toBe(false);
  });
});
