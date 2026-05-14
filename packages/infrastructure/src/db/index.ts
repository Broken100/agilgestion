// packages/infrastructure/src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export * from './schema';
export * from './pool';

type DbType = ReturnType<typeof drizzle<typeof schema>>;

let poolInstance: Pool | null = null;
let dbInstance: DbType | null = null;
let initPromise: Promise<DbType> | null = null;

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return url;
}

export async function getPool(): Promise<Pool> {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  if (!poolInstance) {
    poolInstance = new Pool({ connectionString: url, max: 10 });
  }
  return poolInstance;
}

export function getDb(pool: Pool): DbType {
  if (!dbInstance) {
    dbInstance = drizzle(pool, { schema });
  }
  return dbInstance;
}

export async function initDb(): Promise<DbType | null> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;
  const url = getDatabaseUrl();
  if (!url) {
    console.warn('[initDb] DATABASE_URL not set, skipping');
    return null;
  }
  initPromise = (async (): Promise<DbType> => {
    const pool = new Pool({ connectionString: url, max: 10 });
    poolInstance = pool;
    dbInstance = drizzle(pool, { schema });
    return dbInstance;
  })();
  return initPromise;
}

export function requireDb(): DbType {
  if (dbInstance) return dbInstance;
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error('Database not initialized. DATABASE_URL is not set.');
  }
  poolInstance = new Pool({ connectionString: url, max: 10 });
  dbInstance = drizzle(poolInstance, { schema });
  return dbInstance;
}

export const db: DbType | null = dbInstance;