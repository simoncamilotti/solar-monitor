import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CoreModule } from '@/core';

import { EnphaseModule } from '../modules/enphase/enphase.module';
import { FeatureFlagsModule } from '../modules/feature-flags/feature-flags.module';

@Module({
  imports: [CoreModule, ScheduleModule.forRoot(), EnphaseModule, FeatureFlagsModule],
})
export class AppModule {}
