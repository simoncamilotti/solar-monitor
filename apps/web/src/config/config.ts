import { z } from 'zod';

const configSchema = z.object({
  /** Origin of the API, e.g. `http://localhost:3000`. */
  apiUrl: z.url(),
  oidc: z.object({
    authority: z.url(),
    clientId: z.string().min(1),
  }),
});

export type AppConfig = z.infer<typeof configSchema>;

declare global {
  interface Window {
    __APP_CONFIG__?: unknown;
  }
}

/** Reads `/config.js`, generated when the container starts (ADR 0008). */
export function loadConfig(): AppConfig {
  const result = configSchema.safeParse(window.__APP_CONFIG__);
  if (!result.success) {
    throw new Error(`Invalid /config.js:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
