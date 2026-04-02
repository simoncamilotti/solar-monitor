import { Injectable } from '@nestjs/common';
import type { FeatureFlag } from '@prisma/client';

import type { FeatureFlagDto } from '../dtos/feature-flag.dto';

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
