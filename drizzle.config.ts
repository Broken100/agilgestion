import type { Config } from 'drizzle-kit';

export default {
  schema: './packages/infrastructure/src/db/schema.ts',
  out: './packages/infrastructure/src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;