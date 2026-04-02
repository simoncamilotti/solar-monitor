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

export type LifetimeData = {
  whProduced: number[];
  whConsumed: number[];
  whImported: number[];
  whExported: number[];
};

export type LifetimeDataRecord = {
  date: Date;
  whProduced: number;
  whConsumed: number;
  whImported: number;
  whExported: number;
};
