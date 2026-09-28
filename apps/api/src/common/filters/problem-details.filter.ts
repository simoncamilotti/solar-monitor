import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'node:http';
import { type ValidationError, ValidationException } from './validation.exception.js';

/** RFC 9457 error body. */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance: string;
  errors?: ValidationError[];
}

/** Turns every error into an RFC 9457 Problem Details response (ADR 0007). */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const problem = this.toProblem(exception, request.originalUrl);
    if (problem.status >= 500) {
      this.logger.error(exception);
    }
    response.status(problem.status).type('application/problem+json').json(problem);
  }

  private toProblem(exception: unknown, instance: string): ProblemDetails {
    if (!(exception instanceof HttpException)) {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      return { type: 'about:blank', title: STATUS_CODES[status] ?? 'Error', status, instance };
    }
    const status = exception.getStatus();
    const problem: ProblemDetails = {
      type: 'about:blank',
      title: STATUS_CODES[status] ?? 'Error',
      status,
      detail: exception.message,
      instance,
    };
    if (exception instanceof ValidationException) {
      problem.errors = exception.errors;
    }
    return problem;
  }
}
