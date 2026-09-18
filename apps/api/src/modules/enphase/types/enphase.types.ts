export type EnphaseTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

export type EnphaseTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

export type EnphaseSystemRaw = {
  system_id: number;
  name: string;
  timezone: string;
  status: string;
};

export type EnphaseSystemsResponse = {
  systems: EnphaseSystemRaw[];
};

export type EnphaseLifetimeMeta = {
  status: string;
  last_report_at: number;
  last_energy_at: number;
  operational_at: number;
};

type LifetimeBaseResponse = {
  system_id: number;
  start_date: string;
  meta: EnphaseLifetimeMeta;
};

export type ProductionLifetimeResponse = LifetimeBaseResponse & {
  production: number[];
  meter_start_date: string;
};

export type ConsumptionLifetimeResponse = LifetimeBaseResponse & {
  consumption: number[];
};

export type ExportLifetimeResponse = LifetimeBaseResponse & {
  export: number[];
};

export type ImportLifetimeResponse = LifetimeBaseResponse & {
  import: number[];
};

/**
 * A series of daily readings, carrying the date of its first point exactly as the Enphase API
 * returns it. That date can differ from the one requested: Enphase truncates to the
 * `meter_start_date` of the meter involved, and that meter is not the same for production,
 * consumption, import and export.
 */
export type LifetimeSeries = {
  startDate: string;
  values: number[];
};

export type LifetimeData = {
  whProduced: LifetimeSeries;
  whConsumed: LifetimeSeries;
  whImported: LifetimeSeries;
  whExported: LifetimeSeries;
};

export type LifetimeDataRecord = {
  date: Date;
  whProduced: number;
  whConsumed: number;
  whImported: number;
  whExported: number;
};
