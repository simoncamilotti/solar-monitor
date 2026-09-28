import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

const OPENAPI_JSON_PATH = '/api/openapi.json';
export const API_DOCS_PATH = '/api/docs';

/** OpenAPI document generated from the Zod schemas declared on the routes (ADR 0007). */
export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();
  return SwaggerModule.createDocument(app, config, {
    // `GreetingController.greet` → `greetingGreet`: short names for the generated client.
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey.replace(/Controller$/, '').replace(/^./, (c) => c.toLowerCase())}${methodKey.replace(/^./, (c) => c.toUpperCase())}`,
  });
}

/** Serves the document as JSON and the Scalar reference UI. */
export function setUpApiDocs(app: INestApplication): void {
  const document = createOpenApiDocument(app);
  SwaggerModule.setup(API_DOCS_PATH, app, document, {
    ui: false,
    raw: ['json'],
    jsonDocumentUrl: OPENAPI_JSON_PATH,
  });
  app.use(API_DOCS_PATH, apiReference({ url: OPENAPI_JSON_PATH }));
}
