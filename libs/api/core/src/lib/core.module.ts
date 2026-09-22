import { Global, Module, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule, Params } from 'nestjs-pino';
import { Options } from 'pino-http';

import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

const buildPinoOptions = (configService: ConfigService): Params => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  return {
    forRoutes: [{ method: RequestMethod.ALL, path: '*splat' }],
    pinoHttp: {
      level: isProduction ? 'info' : 'debug',
      genReqId: req => req.headers['x-request-id'] ?? crypto.randomUUID(),
      redact: ['req.headers.authorization', 'req.headers.cookie'],
      autoLogging: {
        ignore: (req): boolean => ['/health'].some(publicPath => req.url === publicPath),
      },
      transport: isProduction ? undefined : { target: 'pino-pretty' },
    } as Options,
  };
};

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    HealthModule,
    PrismaModule,
    AuthModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildPinoOptions,
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [PrismaModule, AuthModule, LoggerModule],
})
export class CoreModule {}
