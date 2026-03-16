import { Injectable } from '@nestjs/common';
import { FeatureFlag } from '@prisma/client';

import type { FeatureFlagDto } from '@/shared-models/server';

@Injectable()
export class FeatureFlagMapper {
  toFeatureFlagDto(flag: FeatureFlag): FeatureFlagDto {
    return {
      key: flag.key,
      enabled: flag.enabled,
    };
  }

  toFeatureFlagDtoList(flags: FeatureFlag[]): FeatureFlagDto[] {
    return flags.map(flag => this.toFeatureFlagDto(flag));
  }
}
