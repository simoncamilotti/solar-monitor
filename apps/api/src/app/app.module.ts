import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CoreModule } from '@/core';

import { EnphaseController } from './controllers/enphase.controller';
import { FeatureFlagController } from './controllers/feature-flag.controller';
import { EnphaseMapper } from './mappers/enphase.mapper';
import { FeatureFlagMapper } from './mappers/feature-flag.mapper';
import { EnphaseApiService } from './services/enphase-api.service';
import { EnphaseAuthService } from './services/enphase-auth.service';
import { EnphaseSyncService } from './services/enphase-sync.service';
import { FeatureFlagService } from './services/feature-flag.service';

@Module({
  imports: [CoreModule, HttpModule.register({ timeout: 30_000 }), ScheduleModule.forRoot()],
  controllers: [EnphaseController, FeatureFlagController],
  providers: [
    EnphaseAuthService,
    EnphaseApiService,
    EnphaseSyncService,
    EnphaseMapper,
    FeatureFlagService,
    FeatureFlagMapper,
  ],
})
export class AppModule {}
