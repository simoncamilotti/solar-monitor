import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CoreModule } from '@/core';

import { EnphaseModule } from '../modules/enphase/enphase.module';

@Module({
  imports: [CoreModule, ScheduleModule.forRoot(), EnphaseModule],
})
export class AppModule {}
