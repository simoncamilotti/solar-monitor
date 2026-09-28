import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ValidationException } from '../filters/validation.exception.js';

/** Validates the parameters that declare a schema (`@Body({ schema })`, `@Query({ schema })`…). */
export function createValidationPipe(): StandardSchemaValidationPipe {
  return new StandardSchemaValidationPipe({
    exceptionFactory: (issues) => new ValidationException(issues),
  });
}
