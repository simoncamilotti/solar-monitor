import { defineConfig } from 'prisma/config';

// Local development: the .env at the repository root. Containers get real variables.
try {
  process.loadEnvFile('.env');
} catch {
  // No .env file: rely on the environment.
}

const basePath = 'libs/api/core/src/prisma';

export default defineConfig({
  schema: `${basePath}/schema.prisma`,
  migrations: {
    path: `${basePath}/migrations`,
  },
  datasource: {
    // Not required by `prisma generate`: only the commands that reach the database need it.
    url: process.env['DATABASE_URL'] ?? '',
  },
});
