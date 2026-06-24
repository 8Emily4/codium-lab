import "server-only";
import { getDb } from "@/lib/db";

/**
 * Lightweight, privacy-friendly visit analytics.
 *
 * One row per page view in `page_visits`. We never store IP addresses — a
 * single anonymous `codium_vid` cookie groups views into "visitors", so
 * "몇 명이 방문했는지"(unique visitors) is just COUNT(DISTINCT visitor_id).
 *
 * All dates are bucketed in KST (`+9 hours`) regardless of server timezone,
 * so daily numbers match what the operator sees on the clock.
 */

let migrated = false;

export async function ensureAnalyticsSchema(): Promise<void> {
  if (migrated) return;
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS page_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL,
      path TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'direct',
      referrer_host TEXT,
      lang TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_visits_created ON page_visits (created_at)`,
  );
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_visits_visitor ON page_visits (visitor_id)`,
  );
  migrated = true;
}

/** Visit source category shown in the admin dashboard. */
export type VisitSource = "direct" | "search" | "social" | "referral";

const SEARCH_HOSTS = ["google.", "bing.", "search.naver.", "search.daum.", "duckduckgo.", "yahoo."];
const SOCIAL_HOSTS = [
  "instagram.",
  "youtube.",
  "youtu.be",
  "facebook.",
  "fb.",
  "threads.",
  "tiktok.",
  "twitter.",
  "x.com",
  "t.co",
  "kakao",
  "band.us",
  "blog.naver.",
  "cafe.naver.",
  "linkedin.",
];

/** Normalise a referrer URL into a bare host like `instagram.com` (or null). */
export function referrerHost(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

/**
 * Decide the traffic source. `utmSource` (from a ?utm_source= on the landing
 * URL) wins when present; otherwise we classify the referrer host. An empty
 * referrer from our own site is treated as direct by the caller.
 */
export function classifySource(
  host: string | null,
  utmSource?: string | null,
): VisitSource {
  const key = (utmSource ?? host ?? "").toLowerCase();
  if (!key) return "direct";
  if (SEARCH_HOSTS.some((h) => key.includes(h)) || /search|naver|daum/.test(key))
    return key.includes("naver") && !key.includes("search") ? "social" : "search";
  if (SOCIAL_HOSTS.some((h) => key.includes(h))) return "social";
  return "referral";
}

export async function recordVisit(input: {
  visitorId: string;
  path: string;
  referrer?: string | null;
  utmSource?: string | null;
  lang?: string | null;
}): Promise<void> {
  await ensureAnalyticsSchema();
  const host = referrerHost(input.referrer);
  // A referrer pointing back at our own host counts as direct navigation.
  const source = classifySource(host, input.utmSource);
  await getDb().execute({
    sql: `INSERT INTO page_visits (visitor_id, path, source, referrer_host, lang)
          VALUES (?, ?, ?, ?, ?)`,
    args: [
      input.visitorId,
      input.path.slice(0, 300),
      source,
      input.utmSource ? input.utmSource.slice(0, 120) : host,
      input.lang ?? null,
    ],
  });
}

/** Total distinct visitors all-time — the number shown in the public footer. */
export async function getTotalVisitors(): Promise<number> {
  try {
    await ensureAnalyticsSchema();
    const rs = await getDb().execute(
      `SELECT COUNT(DISTINCT visitor_id) AS n FROM page_visits`,
    );
    return Number(rs.rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}

export type AnalyticsOverview = {
  totalVisitors: number;
  totalViews: number;
  todayVisitors: number;
  todayViews: number;
};

export async function getOverview(): Promise<AnalyticsOverview> {
  await ensureAnalyticsSchema();
  const rs = await getDb().execute(`
    SELECT
      COUNT(DISTINCT visitor_id) AS total_visitors,
      COUNT(*) AS total_views,
      COUNT(DISTINCT CASE WHEN date(created_at,'unixepoch','+9 hours') = date('now','+9 hours') THEN visitor_id END) AS today_visitors,
      SUM(CASE WHEN date(created_at,'unixepoch','+9 hours') = date('now','+9 hours') THEN 1 ELSE 0 END) AS today_views
    FROM page_visits
  `);
  const r = rs.rows[0] ?? {};
  return {
    totalVisitors: Number(r.total_visitors ?? 0),
    totalViews: Number(r.total_views ?? 0),
    todayVisitors: Number(r.today_visitors ?? 0),
    todayViews: Number(r.today_views ?? 0),
  };
}

export type DailyStat = { day: string; visitors: number; views: number };

export async function getDailyStats(days = 30): Promise<DailyStat[]> {
  await ensureAnalyticsSchema();
  const rs = await getDb().execute({
    sql: `SELECT date(created_at,'unixepoch','+9 hours') AS day,
                 COUNT(DISTINCT visitor_id) AS visitors,
                 COUNT(*) AS views
          FROM page_visits
          WHERE created_at >= unixepoch('now', ?)
          GROUP BY day
          ORDER BY day DESC`,
    args: [`-${days} days`],
  });
  return rs.rows.map((r) => ({
    day: String(r.day),
    visitors: Number(r.visitors ?? 0),
    views: Number(r.views ?? 0),
  }));
}

export type SourceStat = { source: VisitSource; visitors: number; views: number };

export async function getSourceBreakdown(days = 30): Promise<SourceStat[]> {
  await ensureAnalyticsSchema();
  const rs = await getDb().execute({
    sql: `SELECT source,
                 COUNT(DISTINCT visitor_id) AS visitors,
                 COUNT(*) AS views
          FROM page_visits
          WHERE created_at >= unixepoch('now', ?)
          GROUP BY source
          ORDER BY views DESC`,
    args: [`-${days} days`],
  });
  return rs.rows.map((r) => ({
    source: String(r.source) as VisitSource,
    visitors: Number(r.visitors ?? 0),
    views: Number(r.views ?? 0),
  }));
}

export type ReferrerStat = { host: string; views: number };

export async function getTopReferrers(days = 30, limit = 8): Promise<ReferrerStat[]> {
  await ensureAnalyticsSchema();
  const rs = await getDb().execute({
    sql: `SELECT referrer_host AS host, COUNT(*) AS views
          FROM page_visits
          WHERE referrer_host IS NOT NULL
            AND created_at >= unixepoch('now', ?)
          GROUP BY referrer_host
          ORDER BY views DESC
          LIMIT ?`,
    args: [`-${days} days`, limit],
  });
  return rs.rows.map((r) => ({ host: String(r.host), views: Number(r.views ?? 0) }));
}

export type PathStat = { path: string; visitors: number; views: number };

export async function getTopPaths(days = 30, limit = 10): Promise<PathStat[]> {
  await ensureAnalyticsSchema();
  const rs = await getDb().execute({
    sql: `SELECT path,
                 COUNT(DISTINCT visitor_id) AS visitors,
                 COUNT(*) AS views
          FROM page_visits
          WHERE created_at >= unixepoch('now', ?)
          GROUP BY path
          ORDER BY views DESC
          LIMIT ?`,
    args: [`-${days} days`, limit],
  });
  return rs.rows.map((r) => ({
    path: String(r.path),
    visitors: Number(r.visitors ?? 0),
    views: Number(r.views ?? 0),
  }));
}
