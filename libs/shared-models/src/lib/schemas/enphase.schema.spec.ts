import { syncScheduleDtoSchema, updateSyncScheduleRequestDtoSchema } from './enphase.schema';

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
