import {
  enphaseBackfillRequestSchema,
  enphaseSyncRequestSchema,
  syncScheduleSchema,
} from './enphase.js';

describe('syncScheduleSchema', () => {
  it('should accept a valid HH:mm time', () => {
    expect(syncScheduleSchema.safeParse({ syncTime: '02:00' }).success).toBe(true);
  });

  it('should accept midnight', () => {
    expect(syncScheduleSchema.safeParse({ syncTime: '00:00' }).success).toBe(true);
  });

  it('should accept 23:59', () => {
    expect(syncScheduleSchema.safeParse({ syncTime: '23:59' }).success).toBe(true);
  });

  it('should reject missing syncTime', () => {
    expect(syncScheduleSchema.safeParse({}).success).toBe(false);
  });

  it('should reject invalid format without leading zero', () => {
    expect(syncScheduleSchema.safeParse({ syncTime: '2:00' }).success).toBe(false);
  });

  it('should reject format with seconds', () => {
    expect(syncScheduleSchema.safeParse({ syncTime: '02:00:00' }).success).toBe(false);
  });

  it('should reject non-string value', () => {
    expect(syncScheduleSchema.safeParse({ syncTime: 200 }).success).toBe(false);
  });

  it('should reject random string', () => {
    expect(syncScheduleSchema.safeParse({ syncTime: 'noon' }).success).toBe(false);
  });
});

describe('enphaseSyncRequestSchema', () => {
  it('should accept a valid systemId', () => {
    expect(enphaseSyncRequestSchema.safeParse({ systemId: 42 }).success).toBe(true);
  });

  it('should reject a missing systemId', () => {
    expect(enphaseSyncRequestSchema.safeParse({}).success).toBe(false);
  });

  it('should reject a non-integer systemId', () => {
    expect(enphaseSyncRequestSchema.safeParse({ systemId: 'forty-two' }).success).toBe(false);
  });
});

describe('enphaseBackfillRequestSchema', () => {
  it('should accept a valid range', () => {
    expect(
      enphaseBackfillRequestSchema.safeParse({
        systemId: 42,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      }).success,
    ).toBe(true);
  });

  it('should accept a single-day range', () => {
    expect(
      enphaseBackfillRequestSchema.safeParse({
        systemId: 42,
        startDate: '2026-01-01',
        endDate: '2026-01-01',
      }).success,
    ).toBe(true);
  });

  it('should reject when startDate is after endDate', () => {
    expect(
      enphaseBackfillRequestSchema.safeParse({
        systemId: 42,
        startDate: '2026-02-01',
        endDate: '2026-01-01',
      }).success,
    ).toBe(false);
  });

  it('should reject a non-ISO date', () => {
    expect(
      enphaseBackfillRequestSchema.safeParse({
        systemId: 42,
        startDate: '01/01/2026',
        endDate: '2026-01-31',
      }).success,
    ).toBe(false);
  });

  it('should reject a missing systemId', () => {
    expect(
      enphaseBackfillRequestSchema.safeParse({ startDate: '2026-01-01', endDate: '2026-01-31' })
        .success,
    ).toBe(false);
  });
});
