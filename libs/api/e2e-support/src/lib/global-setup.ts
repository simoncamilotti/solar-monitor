import { startApi, migrateDatabase, type RunningApi } from './api-server.js';
import { seedEnphaseFixture } from './enphase-fixture.js';
import { readE2eEnv } from './env.js';
import { E2E_AUDIENCE, type FakeIssuer, startFakeIssuer } from './fake-issuer.js';

/**
 * Shared by api-e2e (Vitest) and web-e2e (Playwright): keys and issuer, migrations,
 * then the production build of the API. Returns the teardown.
 */
export async function setUpE2eStack(workspaceRoot: string): Promise<() => Promise<void>> {
  const env = readE2eEnv();
  if (!env.E2E_DATABASE_URL) {
    throw new Error('E2E_DATABASE_URL is required: see .env.example.');
  }
  const databaseUrl = env.E2E_DATABASE_URL;
  let issuer: FakeIssuer | undefined;
  let api: RunningApi | undefined;
  try {
    issuer = await startFakeIssuer(env.E2E_ISSUER_PORT);
    migrateDatabase(workspaceRoot, databaseUrl);
    seedEnphaseFixture(workspaceRoot, databaseUrl);
    api = await startApi({
      workspaceRoot,
      port: env.E2E_API_PORT,
      databaseUrl,
      issuerUrl: issuer.url,
      audience: E2E_AUDIENCE,
      webUrl: `http://localhost:${env.E2E_WEB_PORT}`,
      timeoutMs: env.E2E_API_TIMEOUT_MS,
    });
  } catch (error) {
    await issuer?.close();
    throw error;
  }

  // Read by the test workers.
  process.env['E2E_API_URL'] = api.url;
  process.env['E2E_OIDC_ISSUER_URL'] = issuer.url;
  process.env['E2E_OIDC_PRIVATE_JWK'] = JSON.stringify(issuer.privateJwk);

  return async () => {
    await api?.stop();
    await issuer?.close();
  };
}
