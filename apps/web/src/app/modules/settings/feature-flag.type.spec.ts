import { featureFlagFormSchema } from './feature-flag.type';

describe('featureFlagFormSchema', () => {
  it('should accept a valid lowercase key', () => {
    expect(featureFlagFormSchema.safeParse({ key: 'projects' }).success).toBe(true);
  });

  it('should accept a hyphenated lowercase key', () => {
    expect(featureFlagFormSchema.safeParse({ key: 'dark-mode' }).success).toBe(true);
  });

  it('should accept a multi-hyphenated key', () => {
    expect(featureFlagFormSchema.safeParse({ key: 'my-new-feature' }).success).toBe(true);
  });

  it('should reject an empty key', () => {
    expect(featureFlagFormSchema.safeParse({ key: '' }).success).toBe(false);
  });

  it('should reject uppercase letters', () => {
    expect(featureFlagFormSchema.safeParse({ key: 'Projects' }).success).toBe(false);
  });

  it('should reject keys with spaces', () => {
    expect(featureFlagFormSchema.safeParse({ key: 'my feature' }).success).toBe(false);
  });

  it('should reject keys starting with a hyphen', () => {
    expect(featureFlagFormSchema.safeParse({ key: '-projects' }).success).toBe(false);
  });

  it('should reject keys ending with a hyphen', () => {
    expect(featureFlagFormSchema.safeParse({ key: 'projects-' }).success).toBe(false);
  });

  it('should reject keys with consecutive hyphens', () => {
    expect(featureFlagFormSchema.safeParse({ key: 'my--feature' }).success).toBe(false);
  });

  it('should reject keys with numbers', () => {
    expect(featureFlagFormSchema.safeParse({ key: 'feature1' }).success).toBe(false);
  });

  it('should reject keys with underscores', () => {
    expect(featureFlagFormSchema.safeParse({ key: 'my_feature' }).success).toBe(false);
  });
});
