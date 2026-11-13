import { billingSchema, installationSchema, tariffCreateSchema } from './pricing.js';

describe('tariffCreateSchema', () => {
  const valid = { kind: 'purchase', pricePerKwh: 0.2516, effectiveFrom: '2025-02-01' };

  it('should accept a price with up to five decimals', () => {
    expect(tariffCreateSchema.safeParse(valid).success).toBe(true);
    expect(tariffCreateSchema.safeParse({ ...valid, pricePerKwh: 0.12345 }).success).toBe(true);
  });

  it('should reject a price with more decimals than stored', () => {
    expect(tariffCreateSchema.safeParse({ ...valid, pricePerKwh: 0.123456 }).success).toBe(false);
  });

  it('should reject a free or negative price', () => {
    expect(tariffCreateSchema.safeParse({ ...valid, pricePerKwh: 0 }).success).toBe(false);
    expect(tariffCreateSchema.safeParse({ ...valid, pricePerKwh: -0.1 }).success).toBe(false);
  });

  it('should reject an unknown kind or a day that does not exist', () => {
    expect(tariffCreateSchema.safeParse({ ...valid, kind: 'peak' }).success).toBe(false);
    expect(tariffCreateSchema.safeParse({ ...valid, effectiveFrom: '2025-02-30' }).success).toBe(
      false,
    );
  });
});

describe('installationSchema', () => {
  it('should accept a cost in cents or no cost', () => {
    expect(installationSchema.safeParse({ cost: 9500.5 }).success).toBe(true);
    expect(installationSchema.safeParse({ cost: null }).success).toBe(true);
  });

  it('should reject a negative cost or fractions of a cent', () => {
    expect(installationSchema.safeParse({ cost: -1 }).success).toBe(false);
    expect(installationSchema.safeParse({ cost: 10.001 }).success).toBe(false);
  });
});

describe('billingSchema', () => {
  it('should accept a day or no day', () => {
    expect(billingSchema.safeParse({ startDate: '2023-03-03' }).success).toBe(true);
    expect(billingSchema.safeParse({ startDate: null }).success).toBe(true);
  });

  it('should reject a day that does not exist or a missing field', () => {
    expect(billingSchema.safeParse({ startDate: '2023-02-30' }).success).toBe(false);
    expect(billingSchema.safeParse({ startDate: '03/03/2023' }).success).toBe(false);
    expect(billingSchema.safeParse({}).success).toBe(false);
  });
});
