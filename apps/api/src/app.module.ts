import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule, type Params } from 'nestjs-pino';
import type { Options } from 'pino-http';

import { AuthModule } from './common/auth/auth.module.js';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard.js';
import { DatabaseModule } from './common/database/database.module.js';
import { validateEnv } from './env.js';
import { EnphaseModule } from './modules/enphase/enphase.module.js';
import { HealthModule } from './modules/health/health.module.js';

const buildPinoOptions = (configService: ConfigService): Params => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  return {
    forRoutes: [{ method: RequestMethod.ALL, path: '*splat' }],
    pinoHttp: {
      level: isProduction ? 'info' : 'debug',
      genReqId: (req) => req.headers['x-request-id'] ?? crypto.randomUUID(),
      redact: ['req.headers.authorization', 'req.headers.cookie'],
      autoLogging: {
        ignore: (req): boolean => ['/health'].some((publicPath) => req.url === publicPath),
      },
      transport: isProduction ? undefined : { target: 'pino-pretty' },
    } as Options,
  };
};

@Module({
  imports: [
    // `process.env` is already fully populated by the time this runs — Nx injects `.env` per task
    // in development, and the deployment (k3s) sets real environment variables in production. There
    // is no `.env` file to load ourselves, so `ignoreEnvFile` keeps `process.env` as the only source.
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, validate: validateEnv }),
    LoggerModule.forRootAsync({ inject: [ConfigService], useFactory: buildPinoOptions }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    DatabaseModule,
    AuthModule,
    HealthModule,
    ScheduleModule.forRoot(),
    EnphaseModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
