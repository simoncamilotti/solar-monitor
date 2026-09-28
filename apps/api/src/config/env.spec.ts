import { validateEnv } from './env.js';

const required = {
  TZ: 'Etc/UTC',
  DATABASE_URL: 'postgresql://app:app@localhost:5432/app',
  OIDC_ISSUER_URL: 'http://localhost:8080/realms/app',
  OIDC_AUDIENCE: 'api',
  ENPHASE_CLIENT_ID: 'client',
  ENPHASE_CLIENT_SECRET: 'secret',
  ENPHASE_API_KEY: 'key',
  ENPHASE_REDIRECT_URI: 'http://localhost:3000/api/enphase/callback',
  ENPHASE_TOKEN_ENCRYPTION_KEY: 'a'.repeat(64),
};

describe('validateEnv', () => {
  it('applies the defaults', () => {
    expect(validateEnv(required)).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'info',
      CORS_ORIGINS: [],
    });
  });

  it('splits the CORS origins', () => {
    expect(
      validateEnv({ ...required, CORS_ORIGINS: 'http://a.test, http://b.test' }).CORS_ORIGINS,
    ).toEqual(['http://a.test', 'http://b.test']);
  });

  it('requires a PostgreSQL database URL', () => {
    expect(() => validateEnv({ ...required, DATABASE_URL: 'mysql://localhost/app' })).toThrow(
      /DATABASE_URL/,
    );
  });

  it('refuses any time zone but UTC', () => {
    expect(() => validateEnv({ ...required, TZ: 'Europe/Paris' })).toThrow(/TZ/);
  });

  it('requires the CORS origins in production', () => {
    expect(() => validateEnv({ ...required, NODE_ENV: 'production' })).toThrow(/CORS_ORIGINS/);
  });

  it('requires a 32-byte hex encryption key', () => {
    expect(() => validateEnv({ ...required, ENPHASE_TOKEN_ENCRYPTION_KEY: 'short' })).toThrow(
      /ENPHASE_TOKEN_ENCRYPTION_KEY/,
    );
  });

  it('rejects an invalid value with a readable message', () => {
    expect(() => validateEnv({ ...required, PORT: 'abc' })).toThrow(/PORT/);
  });
});
