import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { CoreModule } from '@/core';

import { validateEnv } from '../env';
import { EnphaseModule } from '../modules/enphase/enphase.module';

@Module({
  imports: [
    // `process.env` is already fully populated by the time this runs — Nx injects `.env` per task
    // in development, and the deployment (k3s) sets real environment variables in production. There
    // is no `.env` file to load ourselves, so `ignoreEnvFile` keeps `process.env` as the only source.
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, validate: validateEnv }),
    CoreModule,
    ScheduleModule.forRoot(),
    EnphaseModule,
  ],
})
export class AppModule {}
