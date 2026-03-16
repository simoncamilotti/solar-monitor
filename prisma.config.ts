import 'dotenv/config';

import { defineConfig, env } from '@prisma/config';

const basePath = 'libs/api/core/src/prisma';

export default defineConfig({
  schema: `${basePath}/schema.prisma`,
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: `${basePath}/migrations`,
  },
});
