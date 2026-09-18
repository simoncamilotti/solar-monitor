/**
 * Compares the lifetime data stored in the database against what the Enphase API
 * returns today for the same range, and reports any divergence.
 *
 * Written to answer one question: did the date-alignment bug fixed in #25 actually
 * corrupt the stored history, and if so on which days? Before that fix, records were
 * dated by counting forward from the *requested* start date instead of the one the
 * API returns, so a whole range could be written one or more days off.
 *
 * READ-ONLY on the data. It never writes to `EnphaseLifetimeData`. The single write
 * it may perform is rotating an expired OAuth token in `EnphaseToken`, which is
 * unavoidable to call the API at all and is ordinary credential maintenance.
 *
 * Usage:
 *   npm run enphase:verify
 *
 * Exits 1 when a divergence is found, so it can gate a script.
 */
// `npm run` is not an Nx task: nothing loads .env automatically, unlike `nx serve api`. Same
// mechanism as prisma.config.ts.
import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { EnphaseMapper } from '../apps/api/src/modules/enphase/mappers/enphase.mapper';
import type { LifetimeData, LifetimeDataRecord } from '../apps/api/src/modules/enphase/types/enphase.types';

const ENPHASE_API_BASE = 'https://api.enphaseenergy.com/api/v4';
const ENPHASE_TOKEN_URL = 'https://api.enphaseenergy.com/oauth/token';
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

/** How far to look for a systematic shift, in days, in each direction. */
const MAX_SHIFT_PROBED = 15;

type StoredRecord = {
  date: Date;
  whProduced: number;
  whConsumed: number;
  whImported: number;
  whExported: number;
};

type Divergence = {
  day: string;
  field: keyof Omit<StoredRecord, 'date'>;
  stored: number;
  api: number;
};

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const day = (date: Date): string => date.toISOString().slice(0, 10);

export const shiftDay = (isoDay: string, days: number): string => {
  const date = new Date(`${isoDay}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return day(date);
};

export const sameReadings = (a: StoredRecord | LifetimeDataRecord, b: StoredRecord | LifetimeDataRecord): boolean =>
  a.whProduced === b.whProduced &&
  a.whConsumed === b.whConsumed &&
  a.whImported === b.whImported &&
  a.whExported === b.whExported;

/** Mirrors EnphaseAuthService: same endpoint, same Basic auth, same rotation. */
const refreshAccessToken = async (prisma: PrismaClient, systemId: number, refreshToken: string): Promise<string> => {
  const basicAuth = Buffer.from(`${requireEnv('ENPHASE_CLIENT_ID')}:${requireEnv('ENPHASE_CLIENT_SECRET')}`).toString(
    'base64',
  );
  const params = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken });

  const response = await fetch(`${ENPHASE_TOKEN_URL}?${params.toString()}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basicAuth}` },
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed for system ${systemId}: ${response.status} ${await response.text()}`);
  }

  const body = (await response.json()) as { access_token: string; refresh_token: string; expires_in: number };

  await prisma.enphaseToken.update({
    where: { systemId },
    data: {
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      expiresAt: new Date(Date.now() + body.expires_in * 1000),
    },
  });

  return body.access_token;
};

const fetchSeries = async (
  accessToken: string,
  systemId: number,
  path: string,
  from: string,
  to: string,
): Promise<{ start_date: string } & Record<string, unknown>> => {
  const params = new URLSearchParams({ key: requireEnv('ENPHASE_API_KEY'), start_date: from, end_date: to });
  const response = await fetch(`${ENPHASE_API_BASE}/systems/${systemId}${path}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed for system ${systemId}: ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<{ start_date: string } & Record<string, unknown>>;
};

const fetchLifetimeData = async (
  accessToken: string,
  systemId: number,
  from: string,
  to: string,
): Promise<LifetimeData> => {
  const [production, consumption, imported, exported] = await Promise.all([
    fetchSeries(accessToken, systemId, '/energy_lifetime', from, to),
    fetchSeries(accessToken, systemId, '/consumption_lifetime', from, to),
    fetchSeries(accessToken, systemId, '/energy_import_lifetime', from, to),
    fetchSeries(accessToken, systemId, '/energy_export_lifetime', from, to),
  ]);

  return {
    whProduced: { startDate: production.start_date, values: production['production'] as number[] },
    whConsumed: { startDate: consumption.start_date, values: consumption['consumption'] as number[] },
    whImported: { startDate: imported.start_date, values: imported['import'] as number[] },
    whExported: { startDate: exported.start_date, values: exported['export'] as number[] },
  };
};

/**
 * Looks for a constant offset between the two sets.
 *
 * This is the signature of the bug: if the stored readings for day D match what the
 * API reports for D+k, the whole range was written k days off. A best shift of 0 means
 * the dates line up and any difference is a genuine value mismatch.
 */
export const findSystematicShift = (
  stored: Map<string, StoredRecord>,
  api: Map<string, LifetimeDataRecord>,
): { shift: number; matches: number } => {
  let best = { shift: 0, matches: 0 };

  for (let shift = -MAX_SHIFT_PROBED; shift <= MAX_SHIFT_PROBED; shift++) {
    let matches = 0;
    for (const [isoDay, record] of stored) {
      const candidate = api.get(shiftDay(isoDay, shift));
      if (candidate && sameReadings(record, candidate)) {
        matches++;
      }
    }
    if (matches > best.matches) {
      best = { shift, matches };
    }
  }

  return best;
};

const verifySystem = async (
  prisma: PrismaClient,
  tokenRow: {
    id: string;
    systemId: number;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  },
): Promise<boolean> => {
  console.log(`\n═══ System ${tokenRow.systemId} ═══`);

  const storedRows = await prisma.enphaseLifetimeData.findMany({
    where: { enphaseTokenId: tokenRow.id },
    orderBy: { date: 'asc' },
    select: { date: true, whProduced: true, whConsumed: true, whImported: true, whExported: true },
  });

  if (storedRows.length === 0) {
    console.log('  No stored data — nothing to verify.');
    return true;
  }

  const from = day(storedRows[0].date);
  const to = day(storedRows[storedRows.length - 1].date);
  console.log(`  Stored: ${storedRows.length} days, ${from} → ${to}`);

  const accessToken =
    tokenRow.expiresAt.getTime() - Date.now() < REFRESH_MARGIN_MS
      ? await refreshAccessToken(prisma, tokenRow.systemId, tokenRow.refreshToken)
      : tokenRow.accessToken;

  const lifetimeData = await fetchLifetimeData(accessToken, tokenRow.systemId, from, to);
  const apiRecords = new EnphaseMapper().toLifetimeDataRecords(lifetimeData);

  console.log(
    `  API   : ${apiRecords.length} days` +
      `, series start at production=${lifetimeData.whProduced.startDate}` +
      ` consumption=${lifetimeData.whConsumed.startDate}` +
      ` import=${lifetimeData.whImported.startDate}` +
      ` export=${lifetimeData.whExported.startDate}`,
  );

  if (lifetimeData.whProduced.startDate !== from) {
    console.log(`  ⚠ Enphase served ${lifetimeData.whProduced.startDate} for a request starting ${from}.`);
  }

  const stored = new Map(storedRows.map(row => [day(row.date), row]));
  const api = new Map(apiRecords.map(record => [day(record.date), record]));

  const divergences: Divergence[] = [];
  const missingFromApi: string[] = [];

  for (const [isoDay, record] of stored) {
    const counterpart = api.get(isoDay);
    if (!counterpart) {
      missingFromApi.push(isoDay);
      continue;
    }
    for (const field of ['whProduced', 'whConsumed', 'whImported', 'whExported'] as const) {
      if (record[field] !== counterpart[field]) {
        divergences.push({ day: isoDay, field, stored: record[field], api: counterpart[field] });
      }
    }
  }

  const missingFromDb = [...api.keys()].filter(isoDay => !stored.has(isoDay));
  const identical = [...stored].filter(([isoDay, record]) => {
    const counterpart = api.get(isoDay);
    return counterpart && sameReadings(record, counterpart);
  }).length;

  console.log(`  Identical days      : ${identical}/${stored.size}`);
  console.log(`  Diverging values    : ${new Set(divergences.map(d => d.day)).size} days`);
  console.log(`  Missing from API    : ${missingFromApi.length} days`);
  console.log(`  Missing from DB     : ${missingFromDb.length} days`);

  const { shift, matches } = findSystematicShift(stored, api);
  if (shift !== 0 && matches > identical) {
    console.log(
      `\n  ⚠ SYSTEMATIC SHIFT DETECTED: ${matches}/${stored.size} stored days match the API ${Math.abs(shift)} day(s) ` +
        `${shift > 0 ? 'later' : 'earlier'} (shift ${shift > 0 ? '+' : ''}${shift}), against ${identical} matching in place.`,
    );
    console.log('    This is the signature of the date-alignment bug fixed in #25.');
    console.log(
      `    Remediation: POST /api/enphase/backfill?system_id=${tokenRow.systemId}&start_date=${from}&end_date=${to}`,
    );
    console.log('    The backfill upserts on (date, token), so re-running it rewrites the affected days in place.');
  } else if (divergences.length > 0) {
    console.log(
      `\n  No constant shift found (best offset ${shift}) — the differences look like value changes, not a date shift.`,
    );
  }

  if (divergences.length > 0) {
    console.log('\n  First diverging days:');
    for (const d of divergences.slice(0, 10)) {
      console.log(`    ${d.day}  ${d.field.padEnd(11)} stored=${d.stored}  api=${d.api}`);
    }
    if (divergences.length > 10) {
      console.log(`    … and ${divergences.length - 10} more`);
    }
  }

  if (missingFromDb.length > 0) {
    console.log(`\n  Days the API has but the database does not: ${missingFromDb.slice(0, 10).join(', ')}`);
  }

  const clean = divergences.length === 0 && missingFromApi.length === 0 && missingFromDb.length === 0;
  console.log(clean ? '\n  ✓ Stored history matches the API.' : '\n  ✗ Stored history diverges from the API.');

  return clean;
};

const main = async (): Promise<void> => {
  requireEnv('ENPHASE_API_KEY');

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireEnv('DATABASE_URL') }) });

  try {
    const tokens = await prisma.enphaseToken.findMany({ orderBy: { systemId: 'asc' } });

    if (tokens.length === 0) {
      console.log('No linked Enphase system. Nothing to verify.');
      return;
    }

    console.log(`Verifying ${tokens.length} system(s) against the Enphase API.`);
    console.log('No lifetime data will be written — this only reads.');

    const results = [];
    for (const token of tokens) {
      results.push(await verifySystem(prisma, token));
    }

    if (results.includes(false)) {
      console.log('\nAt least one system diverges. See the report above.');
      process.exitCode = 1;
    } else {
      console.log('\nEvery system matches.');
    }
  } finally {
    await prisma.$disconnect();
  }
};

// Only runs when invoked directly: importing this file to reuse its helpers must not trigger the
// verification.
if (process.argv[1]?.endsWith('verify-enphase-history.ts')) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
