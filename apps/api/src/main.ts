import type { INestApplication } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import { join } from 'path';

import { AppModule } from './app/app.module';
import { validateEnv } from './env';

const DEFAULT_TIMEZONE = 'Etc/UTC';
const globalPrefix = 'api';

async function createApp(): Promise<INestApplication> {
  if (process.env.NODE_ENV !== 'test') {
    validateEnv();
  }

  if (process.env.TZ !== DEFAULT_TIMEZONE) {
    throw new Error(`Invalid timezone. Should be defined to ${DEFAULT_TIMEZONE}, got: ${process.env.TZ}`);
  }

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  await setupApp(app);

  return app;
}

export const setupApp = async (app: INestApplication): Promise<void> => {
  app.setGlobalPrefix(globalPrefix, { exclude: ['health'] });
  app.useGlobalPipes(new ZodValidationPipe());

  setupCors(app);
  setupHelmet(app);
  setupLogger(app);
  setupSwagger(app);
};

async function main(): Promise<void> {
  const app = await createApp();
  // when running jest integration tests we can get the error "listen EADDRINUSE: address already in use :::XXXX" even when running in band.
  // this looks to be happening when jest switch to the next test suite. A small hack here is to assign the port to 0 in these cases,
  // where 0 means "assign me a random port that is available"
  const port = process.env.NODE_ENV === 'test' ? 0 : (process.env.PORT ?? 3000);
  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

const setupCors = (app: INestApplication): void => {
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [],
  });
};

const setupHelmet = (app: INestApplication): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  app.use(
    helmet({
      contentSecurityPolicy: isProduction,
      crossOriginOpenerPolicy: isProduction,
    }),
  );
};

const setupLogger = (app: INestApplication): void => {
  if (process.env.NODE_ENV === 'test') {
    app.useLogger(false);
    return;
  }

  app.useLogger(app.get(PinoLogger));
};

const setupSwagger = (app: INestApplication): void => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .addOAuth2({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: `${process.env.KEYCLOAK_ISSUER_URL}/protocol/openid-connect/auth`,
          tokenUrl: `${process.env.KEYCLOAK_ISSUER_URL}/protocol/openid-connect/token`,
          scopes: {
            openid: 'openid',
          },
        },
      },
      'x-tokenName': 'access_token',
    } as any)
    .addSecurityRequirements('oauth2')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'API Docs',
    swaggerOptions: {
      initOAuth: {
        clientId: process.env.KEYCLOAK_CLIENT_ID,
        scopes: ['openid'],
      },
      oauth2RedirectUrl: `http://localhost:${process.env.PORT ?? 3000}/docs/oauth2-redirect.html`,
      usePkceWithAuthorizationCodeGrant: true,
      persistAuthorization: true,
    },
  });

  // Serve custom oauth2-redirect.html that works with window.opener OR window.parent
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/docs/oauth2-redirect.html', (_req: any, res: any) => {
    res.sendFile(join(__dirname, 'swagger', 'oauth2-redirect.html'));
  });
};

main();
