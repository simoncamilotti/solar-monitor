import { applyDecorators, SerializeOptions } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 * Declares the response body in one place: the response goes through the schema
 * (undeclared fields are stripped) and the schema documents the route in OpenAPI.
 */
export const ResponseSchema = (schema: StandardSchemaV1) =>
  applyDecorators(SerializeOptions({ schema }), ApiOkResponse({ standardSchema: schema }));

/**
 * Same for a list: Nest serializes an array item by item, so the item schema is the one that
 * filters, and OpenAPI documents an array of it.
 */
export const ResponseListSchema = (itemSchema: StandardSchemaV1) =>
  applyDecorators(
    SerializeOptions({ schema: itemSchema }),
    ApiOkResponse({ standardSchema: itemSchema, isArray: true }),
  );
