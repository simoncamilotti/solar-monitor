import { z } from 'zod';

/** Configuration of the e2e runs. Local defaults; the CI sets the same variables. */
const e2eEnvSchema = z.object({
  /** Always provided: docker-compose locally, a job service in CI. */
  E2E_DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }).optional(),
  E2E_API_PORT: z.coerce.number().int().default(3901),
  E2E_WEB_PORT: z.coerce.number().int().default(4901),
  E2E_ISSUER_PORT: z.coerce.number().int().default(4902),
  /** How long to wait for the API to become ready. */
  E2E_API_TIMEOUT_MS: z.coerce.number().int().default(60_000),
});

export type E2eEnv = z.infer<typeof e2eEnvSchema>;

export function readE2eEnv(env: NodeJS.ProcessEnv = process.env): E2eEnv {
  const result = e2eEnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid e2e environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
