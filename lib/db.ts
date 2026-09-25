import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pool?: Pool };

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Add your Supabase/PostgreSQL connection string to .env.local or Vercel Environment Variables.");
}

export const pool = globalForDb.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  ssl: { rejectUnauthorized: false },
});

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export async function query<T = any>(text: string, values: any[] = []) {
  return pool.query<T>(text, values);
}

export async function ensureDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin','customer')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS demands (
      id BIGSERIAL PRIMARY KEY,
      customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      budget TEXT DEFAULT '',
      location TEXT NOT NULL,
      required_date TEXT DEFAULT '',
      details TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','In Progress','Completed','Rejected')),
      response TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_demands_customer_id ON demands(customer_id);
    CREATE INDEX IF NOT EXISTS idx_demands_status ON demands(status);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  `);
}
