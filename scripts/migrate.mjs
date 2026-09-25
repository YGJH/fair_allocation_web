import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL ?? process.env.TEST_DATABASE_URL;
if (!connectionString) { console.error('DATABASE_URL is required'); process.exit(1); }
const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000, query_timeout: 15000 });
try {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [20260923]);
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations(version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    const files = (await fs.readdir('db')).filter(f=>/^\d+.*\.sql$/.test(f)).sort();
    for (const file of files) {
      const seen = await client.query('SELECT 1 FROM schema_migrations WHERE version=$1', [file]);
      if (seen.rowCount) continue;
      await client.query(await fs.readFile(path.join('db', file), 'utf8'));
      await client.query('INSERT INTO schema_migrations(version) VALUES($1)', [file]);
      console.log(`applied ${file}`);
    }
    await client.query('COMMIT');
  } catch (e) { await client.query('ROLLBACK'); throw e; }
  finally { client.release(); }
} catch (e) { console.error(e instanceof Error ? e.message : 'migration failed'); process.exitCode = 1; }
finally { await pool.end(); }
