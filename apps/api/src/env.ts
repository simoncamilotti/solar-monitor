import { z } from 'zod';

const envSchema = z.object({
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
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (): Env => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues.map(issue => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Missing or invalid environment variables:\n${formatted}`);
  }

  return result.data;
};
