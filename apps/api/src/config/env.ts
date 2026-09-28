import { z } from 'zod';

const commaSeparatedList = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );

/** Environment variables of the API. Documented in `.env.example`. */
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    /**
     * Dates are stored at UTC midnight and the daily sync runs on UTC days: any other time zone
     * would shift them by one day.
     */
    TZ: z.literal('Etc/UTC', { error: 'TZ must be Etc/UTC: dates are stored at UTC midnight' }),
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    /** OIDC issuer, e.g. `http://localhost:8080/realms/app`. Its keys are found by discovery. */
    OIDC_ISSUER_URL: z.url(),
    /** Expected `aud` claim of the access tokens. */
    OIDC_AUDIENCE: z.string().min(1),
    /** Origins allowed to call the API from a browser, comma-separated. */
    CORS_ORIGINS: commaSeparatedList,
    ENPHASE_CLIENT_ID: z.string().min(1),
    ENPHASE_CLIENT_SECRET: z.string().min(1),
    ENPHASE_API_KEY: z.string().min(1),
    ENPHASE_REDIRECT_URI: z.url(),
    /** 32-byte key, hex-encoded: `openssl rand -hex 32`. Encrypts the Enphase tokens at rest. */
    ENPHASE_TOKEN_ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-f]{64}$/i, 'Must be a 64-character hex string (32 bytes)'),
  })
  .refine((env) => env.NODE_ENV !== 'production' || env.CORS_ORIGINS.length > 0, {
    message: 'CORS_ORIGINS is required in production: without it the browser cannot call the API',
    path: ['CORS_ORIGINS'],
  });

export type Env = z.infer<typeof envSchema>;

/** Validates the environment at startup: the API refuses to start with an invalid configuration. */
export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
