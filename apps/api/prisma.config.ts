import { defineConfig } from 'prisma/config';

// Local development: the .env at the repository root. Containers get real variables.
try {
  process.loadEnvFile('../../.env');
} catch {
  // No .env file: rely on the environment.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Not required by `prisma generate`: only the commands that reach the database need it.
    url: process.env['DATABASE_URL'] ?? '',
  },
});
