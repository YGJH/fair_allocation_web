import { Pool, PoolClient, type QueryResultRow } from 'pg';
let pool: Pool | undefined;
export function getPool() {
  return pool ??= new Pool({
    connectionString: process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL,
    connectionTimeoutMillis: 1500,
    idleTimeoutMillis: 10_000,
    query_timeout: 5_000,
    max: 10,
  });
}
export async function withClient<T>(fn:(client:PoolClient)=>Promise<T>) { const client = await getPool().connect(); try { return await fn(client); } finally { client.release(); } }
export async function query<T extends QueryResultRow = any>(text:string, params:any[]=[]){ return getPool().query<T>(text, params); }
export async function closePool(){ if(pool){ await pool.end(); pool=undefined; } }
