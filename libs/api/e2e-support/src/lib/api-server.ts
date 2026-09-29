import { type ChildProcess, execFileSync, spawn } from 'node:child_process';
import { join } from 'node:path';

export interface StartApiOptions {
  /** Root of the repository: the API is started from `apps/api/dist`. */
  workspaceRoot: string;
  port: number;
  databaseUrl: string;
  issuerUrl: string;
  audience: string;
  webUrl: string;
  timeoutMs: number;
}

export interface RunningApi {
  url: string;
  stop: () => Promise<void>;
}

/** Applies the migrations to the e2e database, as the Kubernetes Job does in production. */
export function migrateDatabase(workspaceRoot: string, databaseUrl: string): void {
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: join(workspaceRoot, 'apps/api'),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  });
}

/** Starts the production build of the API and waits until it is ready. */
export async function startApi(options: StartApiOptions): Promise<RunningApi> {
  const url = `http://localhost:${options.port}`;
  const output: string[] = [];
  const child: ChildProcess = spawn(
    'node',
    ['--import', './dist/instrumentation.js', 'dist/main.js'],
    {
      cwd: join(options.workspaceRoot, 'apps/api'),
      env: {
        ...process.env,
        NODE_ENV: 'test',
        PORT: String(options.port),
        LOG_LEVEL: 'warn',
        DATABASE_URL: options.databaseUrl,
        OIDC_ISSUER_URL: options.issuerUrl,
        OIDC_AUDIENCE: options.audience,
        TZ: 'Etc/UTC',
        CORS_ORIGINS: options.webUrl,
        // Required at boot; the tests never reach Enphase.
        ENPHASE_CLIENT_ID: 'e2e',
        ENPHASE_CLIENT_SECRET: 'e2e',
        ENPHASE_API_KEY: 'e2e',
        ENPHASE_REDIRECT_URI: `http://localhost:${options.port}/api/enphase/callback`,
        ENPHASE_TOKEN_ENCRYPTION_KEY: '0'.repeat(64),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  child.stdout?.on('data', (chunk: Buffer) => output.push(chunk.toString()));
  child.stderr?.on('data', (chunk: Buffer) => output.push(chunk.toString()));

  const stop = () =>
    new Promise<void>((resolve) => {
      if (child.exitCode !== null) {
        resolve();
        return;
      }
      child.once('exit', () => resolve());
      child.kill('SIGTERM');
    });

  try {
    await waitUntilReady(`${url}/api/health/ready`, options.timeoutMs, () => child.exitCode);
  } catch (error) {
    await stop();
    throw new Error(`${(error as Error).message}\n--- API output ---\n${output.join('')}`);
  }
  return { url, stop };
}

async function waitUntilReady(
  healthUrl: string,
  timeoutMs: number,
  exitCode: () => number | null,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError = 'no response';
  while (Date.now() < deadline) {
    if (exitCode() !== null) {
      throw new Error(`The API exited with code ${exitCode()} before being ready.`);
    }
    try {
      const response = await fetch(healthUrl);
      if (response.ok) {
        return;
      }
      lastError = `HTTP ${response.status}: ${await response.text()}`;
    } catch (error) {
      lastError = String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(
    `The API was not ready after ${timeoutMs} ms (${healthUrl}). Last error: ${lastError}. ` +
      'Increase E2E_API_TIMEOUT_MS if the machine is slow.',
  );
}
