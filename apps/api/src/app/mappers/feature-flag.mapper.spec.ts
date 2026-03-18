import type { FeatureFlag } from '@prisma/client';

import { FeatureFlagMapper } from './feature-flag.mapper';

describe('FeatureFlagMapper', () => {
  let mapper: FeatureFlagMapper;

  beforeEach(() => {
    mapper = new FeatureFlagMapper();
  });

  describe('toFeatureFlagDto', () => {
    it('should map Prisma entity to DTO', () => {
      const flag: FeatureFlag = {
        key: 'dark-mode',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = mapper.toFeatureFlagDto(flag);

      expect(result).toEqual({ key: 'dark-mode', enabled: true });
    });

    it('should not include Prisma-specific fields', () => {
      const flag: FeatureFlag = {
        key: 'blog',
        enabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = mapper.toFeatureFlagDto(flag);

      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });
  });

  describe('toFeatureFlagDtoList', () => {
    it('should map multiple entities', () => {
      const flags: FeatureFlag[] = [
        { key: 'dark-mode', enabled: true, createdAt: new Date(), updatedAt: new Date() },
        { key: 'blog', enabled: false, createdAt: new Date(), updatedAt: new Date() },
      ];

      const result = mapper.toFeatureFlagDtoList(flags);

      expect(result).toEqual([
        { key: 'dark-mode', enabled: true },
        { key: 'blog', enabled: false },
      ]);
    });

    it('should return empty array for empty input', () => {
      const result = mapper.toFeatureFlagDtoList([]);

      expect(result).toEqual([]);
    });
  });
});
