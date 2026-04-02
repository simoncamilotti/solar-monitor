import { Module } from '@nestjs/common';

import { FeatureFlagController } from './controllers/feature-flag.controller';
import { FeatureFlagMapper } from './mappers/feature-flag.mapper';
import { FeatureFlagService } from './services/feature-flag.service';

@Module({
  controllers: [FeatureFlagController],
  providers: [FeatureFlagService, FeatureFlagMapper],
})
export class FeatureFlagsModule {}
