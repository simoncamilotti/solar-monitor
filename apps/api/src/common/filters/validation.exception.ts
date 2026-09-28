import { BadRequestException } from '@nestjs/common';
import type { StandardSchemaV1 } from '@standard-schema/spec';

export interface ValidationError {
  path: string;
  message: string;
}

export class ValidationException extends BadRequestException {
  readonly errors: ValidationError[];

  constructor(issues: readonly StandardSchemaV1.Issue[]) {
    super('The request is invalid.');
    this.errors = issues.map((issue) => ({
      path: (issue.path ?? [])
        .map((segment) => (typeof segment === 'object' ? segment.key : segment))
        .join('.'),
      message: issue.message,
    }));
  }
}
