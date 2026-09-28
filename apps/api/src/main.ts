import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';
import { API_DOCS_PATH, setUpApiDocs } from './openapi.js';

const app = await NestFactory.create(AppModule, { bufferLogs: true });
app.useLogger(app.get(Logger));

const config = app.get<ConfigService<Env, true>>(ConfigService);
app.setGlobalPrefix('api');

// The Scalar UI loads its script from a CDN: relax the content security policy on the docs only.
const secureHeaders = helmet();
const docsHeaders = helmet({ contentSecurityPolicy: false });
app.use((request: Request, response: Response, next: NextFunction) =>
  request.path.startsWith(API_DOCS_PATH)
    ? docsHeaders(request, response, next)
    : secureHeaders(request, response, next),
);
app.enableCors({ origin: config.get('CORS_ORIGINS', { infer: true }), credentials: true });
app.enableShutdownHooks();

// API reference: development only, the API stays opaque in production.
if (config.get('NODE_ENV', { infer: true }) !== 'production') {
  setUpApiDocs(app);
}

await app.listen(config.get('PORT', { infer: true }));
