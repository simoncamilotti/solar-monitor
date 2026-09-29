import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

/**
 * Production history shared by every test. Unlike users, it cannot be made unique per test: the
 * application has a single household and reads all the stored days. It is inserted once, never
 * modified by a test, so the screenshots stay stable.
 *
 * System 1 has six days, with holes between them; system 2 is linked but has no data yet.
 */
export const ENPHASE_FIXTURE = {
  systems: [1, 2],
  days: [
    {
      date: '2024-01-15',
      whProduced: 12_500,
      whConsumed: 8_300,
      whImported: 2_100,
      whExported: 6_300,
    },
    {
      date: '2024-02-20',
      whProduced: 15_000,
      whConsumed: 10_200,
      whImported: 1_500,
      whExported: 6_300,
    },
    {
      date: '2024-03-10',
      whProduced: 18_000,
      whConsumed: 11_000,
      whImported: 1_000,
      whExported: 8_000,
    },
    {
      date: '2024-04-15',
      whProduced: 20_500,
      whConsumed: 9_500,
      whImported: 500,
      whExported: 11_500,
    },
    {
      date: '2024-05-20',
      whProduced: 25_000,
      whConsumed: 10_000,
      whImported: 300,
      whExported: 15_300,
    },
    {
      date: '2024-06-10',
      whProduced: 22_000,
      whConsumed: 12_000,
      whImported: 800,
      whExported: 10_800,
    },
  ],
} as const;

const tokenId = (systemId: number) => `e2e-system-${systemId}`;

/** Inserts the fixture if missing, through the Prisma CLI of the API (no database driver here). */
export function seedEnphaseFixture(workspaceRoot: string, databaseUrl: string): void {
  // Placeholder tokens, far from expiring: the API never tries to refresh them.
  const tokens = ENPHASE_FIXTURE.systems.map(
    (systemId) => `('${tokenId(systemId)}', ${systemId}, 'e2e', 'e2e', '2099-01-01', now())`,
  );
  const days = ENPHASE_FIXTURE.days.map(
    (day) =>
      `('e2e-${day.date}', '${day.date}', ${day.whProduced}, ${day.whConsumed}, ` +
      `${day.whExported}, ${day.whImported}, '${tokenId(1)}')`,
  );
  const sql = `
    INSERT INTO "EnphaseToken" ("id", "systemId", "accessToken", "refreshToken", "expiresAt", "updatedAt")
    VALUES ${tokens.join(',\n')}
    ON CONFLICT ("systemId") DO NOTHING;
    INSERT INTO "EnphaseLifetimeData" ("id", "date", "whProduced", "whConsumed", "whExported", "whImported", "enphaseTokenId")
    VALUES ${days.join(',\n')}
    ON CONFLICT ("date", "enphaseTokenId") DO NOTHING;
  `;

  execFileSync('pnpm', ['exec', 'prisma', 'db', 'execute', '--stdin'], {
    cwd: join(workspaceRoot, 'apps/api'),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    input: sql,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}
