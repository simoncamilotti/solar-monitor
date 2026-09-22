import { z } from 'zod';

const envSchema = z
  .object({
    DATABASE_URL: z.url(),
    KEYCLOAK_ISSUER_URL: z.url(),
    KEYCLOAK_CLIENT_ID: z.string().min(1),
    CORS_ORIGINS: z.string().optional(),
    PORT: z.coerce.number().optional().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
    TZ: z.string().optional().default('Etc/UTC'),
    ENPHASE_CLIENT_ID: z.string().min(1),
    ENPHASE_CLIENT_SECRET: z.string().min(1),
    ENPHASE_API_KEY: z.string().min(1),
    ENPHASE_REDIRECT_URI: z.url(),
    ENPHASE_TOKEN_ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-f]{64}$/i, 'Must be a 64-character hex string (32 bytes) — generate with `openssl rand -hex 32`'),
  })
  .check(ctx => {
    if (ctx.value.NODE_ENV === 'production' && !ctx.value.CORS_ORIGINS) {
      ctx.issues.push({
        code: 'custom',
        message: 'CORS_ORIGINS is required in production — an unset value silently blocks the entire frontend',
        path: ['CORS_ORIGINS'],
        input: ctx.value.CORS_ORIGINS,
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

// Also serves as the `validate` function passed to `ConfigModule.forRoot`, which calls it with
// the raw config object instead of letting it read `process.env` itself.
export const validateEnv = (config: Record<string, unknown> = process.env): Env => {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const formatted = result.error.issues.map(issue => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Missing or invalid environment variables:\n${formatted}`);
  }

  return result.data;
};
