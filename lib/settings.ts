import "server-only";
import { getDb } from "@/lib/db";

/**
 * Small key/value store for site-wide toggles that admins flip from the
 * workspace (e.g. whether the tech-blog menu shows in the public nav).
 * Kept separate from feature tables so new flags are a one-line addition.
 */

let migrated = false;

async function ensureSettingsSchema(): Promise<void> {
  if (migrated) return;
  await getDb().execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  migrated = true;
}

export async function getSetting(key: string): Promise<string | null> {
  await ensureSettingsSchema();
  const rs = await getDb().execute({
    sql: `SELECT value FROM site_settings WHERE key = ?`,
    args: [key],
  });
  const v = rs.rows[0]?.value;
  return v == null ? null : String(v);
}

export async function setSetting(key: string, value: string): Promise<void> {
  await ensureSettingsSchema();
  await getDb().execute({
    sql: `INSERT INTO site_settings (key, value, updated_at)
          VALUES (?, ?, unixepoch())
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()`,
    args: [key, value],
  });
}

/* ------------------------------------------------------------------ */
/* Typed flags                                                         */
/* ------------------------------------------------------------------ */

const BLOG_NAV_KEY = "blog_nav_visible";

/**
 * Whether the 기술블로그 menu is shown in the public nav. Defaults to OFF
 * so a new blog stays hidden until an admin publishes posts and flips it on.
 * Resilient: any DB hiccup hides the menu rather than breaking every page,
 * since this runs in the global <Nav> on every site render.
 */
export async function isBlogNavVisible(): Promise<boolean> {
  try {
    return (await getSetting(BLOG_NAV_KEY)) === "1";
  } catch {
    return false;
  }
}

export async function setBlogNavVisible(visible: boolean): Promise<void> {
  await setSetting(BLOG_NAV_KEY, visible ? "1" : "0");
}
