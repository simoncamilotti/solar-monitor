import {
  enphaseBackfillRequestDtoSchema,
  enphaseSyncRequestDtoSchema,
  syncScheduleDtoSchema,
  updateSyncScheduleRequestDtoSchema,
} from './enphase.schema';

describe('syncScheduleDtoSchema', () => {
  it('should accept a valid HH:mm time', () => {
    expect(syncScheduleDtoSchema.safeParse({ syncTime: '02:00' }).success).toBe(true);
  });

  it('should accept midnight', () => {
    expect(syncScheduleDtoSchema.safeParse({ syncTime: '00:00' }).success).toBe(true);
  });

  it('should accept 23:59', () => {
    expect(syncScheduleDtoSchema.safeParse({ syncTime: '23:59' }).success).toBe(true);
  });

  it('should reject missing syncTime', () => {
    expect(syncScheduleDtoSchema.safeParse({}).success).toBe(false);
  });

  it('should reject invalid format without leading zero', () => {
    expect(syncScheduleDtoSchema.safeParse({ syncTime: '2:00' }).success).toBe(false);
  });

  it('should reject format with seconds', () => {
    expect(syncScheduleDtoSchema.safeParse({ syncTime: '02:00:00' }).success).toBe(false);
  });

  it('should reject non-string value', () => {
    expect(syncScheduleDtoSchema.safeParse({ syncTime: 200 }).success).toBe(false);
  });

  it('should reject random string', () => {
    expect(syncScheduleDtoSchema.safeParse({ syncTime: 'noon' }).success).toBe(false);
  });
});

describe('updateSyncScheduleRequestDtoSchema', () => {
  it('should accept a valid update request', () => {
    expect(updateSyncScheduleRequestDtoSchema.safeParse({ syncTime: '14:30' }).success).toBe(true);
  });

  it('should reject when syncTime is missing', () => {
    expect(updateSyncScheduleRequestDtoSchema.safeParse({}).success).toBe(false);
  });
});

describe('enphaseSyncRequestDtoSchema', () => {
  it('should accept a valid systemId', () => {
    expect(enphaseSyncRequestDtoSchema.safeParse({ systemId: 42 }).success).toBe(true);
  });

  it('should reject a missing systemId', () => {
    expect(enphaseSyncRequestDtoSchema.safeParse({}).success).toBe(false);
  });

  it('should reject a non-integer systemId', () => {
    expect(enphaseSyncRequestDtoSchema.safeParse({ systemId: 'forty-two' }).success).toBe(false);
  });
});

describe('enphaseBackfillRequestDtoSchema', () => {
  it('should accept a valid range', () => {
    expect(
      enphaseBackfillRequestDtoSchema.safeParse({ systemId: 42, startDate: '2026-01-01', endDate: '2026-01-31' })
        .success,
    ).toBe(true);
  });

  it('should accept a single-day range', () => {
    expect(
      enphaseBackfillRequestDtoSchema.safeParse({ systemId: 42, startDate: '2026-01-01', endDate: '2026-01-01' })
        .success,
    ).toBe(true);
  });

  it('should reject when startDate is after endDate', () => {
    expect(
      enphaseBackfillRequestDtoSchema.safeParse({ systemId: 42, startDate: '2026-02-01', endDate: '2026-01-01' })
        .success,
    ).toBe(false);
  });

  it('should reject a non-ISO date', () => {
    expect(
      enphaseBackfillRequestDtoSchema.safeParse({ systemId: 42, startDate: '01/01/2026', endDate: '2026-01-31' })
        .success,
    ).toBe(false);
  });

  it('should reject a missing systemId', () => {
    expect(enphaseBackfillRequestDtoSchema.safeParse({ startDate: '2026-01-01', endDate: '2026-01-31' }).success).toBe(
      false,
    );
  });
});
