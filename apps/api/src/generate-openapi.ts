/**
 * Writes the OpenAPI document without starting the server: `node dist/generate-openapi.js <file>`.
 * Consumed by orval to generate `@repo/api-client` (ADR 0008).
 */
import { writeFileSync } from 'node:fs';

// Placeholders only: the document does not depend on the runtime configuration.
process.env['NODE_ENV'] ||= 'production';
process.env['TZ'] ||= 'Etc/UTC';
process.env['DATABASE_URL'] ||= 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
process.env['OIDC_ISSUER_URL'] ||= 'http://localhost/placeholder';
process.env['OIDC_AUDIENCE'] ||= 'placeholder';
process.env['CORS_ORIGINS'] ||= 'http://localhost';
process.env['ENPHASE_CLIENT_ID'] ||= 'placeholder';
process.env['ENPHASE_CLIENT_SECRET'] ||= 'placeholder';
process.env['ENPHASE_API_KEY'] ||= 'placeholder';
process.env['ENPHASE_REDIRECT_URI'] ||= 'http://localhost/placeholder';
process.env['ENPHASE_TOKEN_ENCRYPTION_KEY'] ||= '0'.repeat(64);

const { NestFactory } = await import('@nestjs/core');
const { AppModule } = await import('./app.module.js');
const { createOpenApiDocument } = await import('./openapi.js');

const output = process.argv[2] ?? 'openapi.json';
const app = await NestFactory.create(AppModule, { preview: true, logger: false });
app.setGlobalPrefix('api');
writeFileSync(output, `${JSON.stringify(createOpenApiDocument(app), null, 2)}\n`);
await app.close();
