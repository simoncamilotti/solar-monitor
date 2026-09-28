import type { Params } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { Env } from './env.js';

/** JSON logs in production, readable logs in development (ADR 0007). */
export function loggerParams(env: Pick<Env, 'NODE_ENV' | 'LOG_LEVEL'>): Params {
  return {
    pinoHttp: {
      level: env.LOG_LEVEL,
      transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
      genReqId: (request: IncomingMessage) => {
        const header = request.headers['x-request-id'];
        return (Array.isArray(header) ? header[0] : header) ?? randomUUID();
      },
      redact: ['req.headers.authorization', 'req.headers.cookie'],
      autoLogging: {
        ignore: (request: IncomingMessage) => request.url?.startsWith('/api/health') ?? false,
      },
    },
  };
}
