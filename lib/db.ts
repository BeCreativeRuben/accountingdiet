/**
 * Neon Postgres client. Use DATABASE_URL in .env (from Neon quickstart).
 * When DATABASE_URL is not set, the app falls back to in-memory store via lib/store.
 */

import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> | null {
  if (sql !== null) return sql;
  const url = process.env.DATABASE_URL;
  if (!url || url.trim() === '') {
    return null;
  }
  sql = neon(url);
  return sql;
}

export function hasDatabase(): boolean {
  return getSql() !== null;
}

export function getDb(): NeonQueryFunction<false, false> {
  const client = getSql();
  if (!client) {
    throw new Error('DATABASE_URL is not set. Add it to .env or use in-memory store.');
  }
  return client;
}
