import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;
let migrated = false;

/** Add a column to an existing table only if it isn't already there. */
async function ensureColumn(
  db: Client,
  table: string,
  column: string,
  type: string,
): Promise<void> {
  const info = await db.execute(`PRAGMA table_info(${table})`);
  const exists = info.rows.some((r) => String(r.name) === column);
  if (!exists) {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

export function getDb(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Copy .env.local.example to .env.local."
    );
  }

  client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });

  return client;
}

export async function ensureSchema(): Promise<void> {
  if (migrated) return;
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      organization TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      name TEXT,
      email TEXT,
      avatar TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      last_login_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  // 강의자료/콘텐츠 — code-pulse 기술검토 패턴을 libSQL에 맞게 구현.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT,
      body TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      access TEXT NOT NULL DEFAULT 'restricted',
      category TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      author_id TEXT,
      author_name TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  // 접근권한 부여 — 특정 사용자 × 특정 자료 × 기간(초 단위 unix, NULL=무기한).
  await db.execute(`
    CREATE TABLE IF NOT EXISTS material_grants (
      id TEXT PRIMARY KEY,
      material_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      starts_at INTEGER,
      ends_at INTEGER,
      granted_by TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE (material_id, user_id)
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_grants_user ON material_grants (user_id)`,
  );
  // Older `users` tables predate the login-source column — add it idempotently
  // so we can show whether a login came from local dev or production.
  await ensureColumn(db, "users", "last_login_host", "TEXT");
  migrated = true;
}
