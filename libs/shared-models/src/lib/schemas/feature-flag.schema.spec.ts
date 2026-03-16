import {
  createFeatureFlagDtoRequestSchema,
  featureFlagDtoSchema,
  updateFeatureFlagRequestDtoSchema,
} from './feature-flag.schema';

describe('featureFlagDtoSchema', () => {
  it('should accept a valid feature flag', () => {
    const result = featureFlagDtoSchema.safeParse({ key: 'dark-mode', enabled: true });
    expect(result.success).toBe(true);
  });

  it('should reject when key is missing', () => {
    const result = featureFlagDtoSchema.safeParse({ enabled: true });
    expect(result.success).toBe(false);
  });

  it('should reject when enabled is missing', () => {
    const result = featureFlagDtoSchema.safeParse({ key: 'dark-mode' });
    expect(result.success).toBe(false);
  });
});

describe('createFeatureFlagDtoRequestSchema', () => {
  it('should accept a valid create request', () => {
    const result = createFeatureFlagDtoRequestSchema.safeParse({ key: 'beta', enabled: false });
    expect(result.success).toBe(true);
  });
});

describe('updateFeatureFlagRequestDtoSchema', () => {
  it('should accept a valid update request', () => {
    const result = updateFeatureFlagRequestDtoSchema.safeParse({ enabled: true });
    expect(result.success).toBe(true);
  });

  it('should reject when enabled is not a boolean', () => {
    const result = updateFeatureFlagRequestDtoSchema.safeParse({ enabled: 'yes' });
    expect(result.success).toBe(false);
  });
});
