// packages/infrastructure/src/db/pool.ts
import { Pool, PoolClient } from 'pg';

export async function createTenantPool(
  connectionString: string,
  businessId: string
): Promise<Pool> {
  const pool = new Pool({ connectionString, max: 10 });

  pool.on('connect', (client) => {
    client.query(`SET app.current_business_id = '${businessId}'`);
  });

  return pool;
}

export async function withBusinessContext<T>(
  pool: Pool,
  businessId: string,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query(`SET app.current_business_id = '${businessId}'`);
    return await fn(client);
  } finally {
    client.query(`RESET app.current_business_id`);
    client.release();
  }
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return url;
}