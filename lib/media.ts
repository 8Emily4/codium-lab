import "server-only";
import { getDb } from "@/lib/db";

/**
 * AI로 제작한 유튜브/인스타/기타 콘텐츠를 관리자 화면에서 등록하면
 * /media 페이지에 노출됩니다. 데이터는 Turso(libSQL)에 저장됩니다.
 */

export type MediaType = "youtube" | "instagram" | "other";

export const MEDIA_TYPES: MediaType[] = ["youtube", "instagram", "other"];

export function isMediaType(v: unknown): v is MediaType {
  return typeof v === "string" && (MEDIA_TYPES as string[]).includes(v);
}

export type MediaContent = {
  id: number;
  type: MediaType;
  title: string;
  description: string | null;
  url: string;
  /** Explicit thumbnail override; YouTube derives one automatically when blank. */
  thumbnail: string | null;
  tags: string[];
  featured: boolean;
  published: boolean;
  createdBy: string | null;
  createdAt: number;
  updatedAt: number;
};

let migrated = false;

export async function ensureMediaSchema(): Promise<void> {
  if (migrated) return;
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS media_contents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT NOT NULL,
      thumbnail TEXT,
      tags TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      created_by TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  // Registered YouTube channels — their recent uploads are pulled live (RSS)
  // and shown on /media, so the wife doesn't register each video by hand.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS media_channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT NOT NULL UNIQUE,
      handle TEXT,
      title TEXT NOT NULL,
      avatar TEXT,
      url TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      created_by TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  // Last-known-good uploads per channel. YouTube's RSS feed is intermittently
  // flaky (5xx/429); when a live fetch fails we fall back to this cache so a
  // registered channel never blinks out of the page on a transient hiccup.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS media_channel_videos (
      channel_id TEXT PRIMARY KEY,
      videos TEXT NOT NULL DEFAULT '[]',
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  migrated = true;
}

/* ------------------------------------------------------------------ */
/* URL helpers                                                         */
/* ------------------------------------------------------------------ */

/** Extract a YouTube video id from any common URL shape (watch, youtu.be, shorts, embed). */
export function parseYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/live\/)([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export function youTubeThumbnail(id: string): string {
  // hqdefault is the most reliably-present size across all videos.
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youTubeEmbedUrl(id: string): string {
  // Privacy-enhanced domain; no related videos from other channels.
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}

/** Best thumbnail for a card: explicit override wins, then YouTube auto-derive. */
export function resolveThumbnail(item: MediaContent): string | null {
  if (item.thumbnail) return item.thumbnail;
  if (item.type === "youtube") {
    const id = parseYouTubeId(item.url);
    if (id) return youTubeThumbnail(id);
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Mapping + queries                                                   */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

function mapRow(row: Row): MediaContent {
  const rawTags = row.tags == null ? "" : String(row.tags);
  return {
    id: Number(row.id),
    type: isMediaType(row.type) ? row.type : "other",
    title: String(row.title),
    description: row.description == null ? null : String(row.description),
    url: String(row.url),
    thumbnail: row.thumbnail == null ? null : String(row.thumbnail),
    tags: rawTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    featured: Number(row.featured) === 1,
    published: Number(row.published) === 1,
    createdBy: row.created_by == null ? null : String(row.created_by),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

const SELECT = `SELECT id, type, title, description, url, thumbnail, tags,
                       featured, published, created_by, created_at, updated_at
                FROM media_contents`;

/** Public page: only published rows, featured pinned first, then newest. */
export async function listPublishedMedia(): Promise<MediaContent[]> {
  await ensureMediaSchema();
  const rs = await getDb().execute(
    `${SELECT} WHERE published = 1
     ORDER BY featured DESC, created_at DESC`,
  );
  return rs.rows.map((r) => mapRow(r as Row));
}

/** Admin page: every row, drafts included. */
export async function listAllMedia(): Promise<MediaContent[]> {
  await ensureMediaSchema();
  const rs = await getDb().execute(
    `${SELECT} ORDER BY featured DESC, created_at DESC`,
  );
  return rs.rows.map((r) => mapRow(r as Row));
}

export type MediaInput = {
  type: MediaType;
  title: string;
  description?: string | null;
  url: string;
  thumbnail?: string | null;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
};

function normalizeTags(tags: string[] | undefined): string {
  if (!tags) return "";
  return tags.map((t) => t.trim()).filter(Boolean).join(", ");
}

export async function createMedia(
  input: MediaInput,
  createdBy: string | null,
): Promise<void> {
  await ensureMediaSchema();
  await getDb().execute({
    sql: `INSERT INTO media_contents
            (type, title, description, url, thumbnail, tags, featured, published, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.type,
      input.title,
      input.description?.trim() || null,
      input.url,
      input.thumbnail?.trim() || null,
      normalizeTags(input.tags),
      input.featured ? 1 : 0,
      input.published === false ? 0 : 1,
      createdBy,
    ],
  });
}

export async function updateMedia(
  id: number,
  input: MediaInput,
): Promise<void> {
  await ensureMediaSchema();
  await getDb().execute({
    sql: `UPDATE media_contents SET
            type = ?, title = ?, description = ?, url = ?, thumbnail = ?,
            tags = ?, featured = ?, published = ?, updated_at = unixepoch()
          WHERE id = ?`,
    args: [
      input.type,
      input.title,
      input.description?.trim() || null,
      input.url,
      input.thumbnail?.trim() || null,
      normalizeTags(input.tags),
      input.featured ? 1 : 0,
      input.published === false ? 0 : 1,
      id,
    ],
  });
}

export async function deleteMedia(id: number): Promise<void> {
  await ensureMediaSchema();
  await getDb().execute({
    sql: `DELETE FROM media_contents WHERE id = ?`,
    args: [id],
  });
}

/** Flip a single boolean flag (published / featured) without a full edit. */
export async function setMediaFlag(
  id: number,
  flag: "published" | "featured",
  value: boolean,
): Promise<void> {
  await ensureMediaSchema();
  const column = flag === "published" ? "published" : "featured";
  await getDb().execute({
    sql: `UPDATE media_contents SET ${column} = ?, updated_at = unixepoch() WHERE id = ?`,
    args: [value ? 1 : 0, id],
  });
}

/* ================================================================== */
/* YouTube channels — registered once, recent uploads pulled live      */
/* ================================================================== */

export type MediaChannel = {
  id: number;
  channelId: string; // UC...
  handle: string | null;
  title: string;
  avatar: string | null;
  url: string;
  featured: boolean;
  published: boolean;
  createdBy: string | null;
  createdAt: number;
  updatedAt: number;
};

export type ChannelVideo = {
  videoId: string;
  title: string;
  url: string;
  thumb: string;
  publishedAt: number;
};

export type ResolvedChannel = {
  channelId: string;
  handle: string | null;
  title: string;
  avatar: string | null;
  url: string;
};

// A desktop UA so YouTube serves the full HTML (not the consent stub).
const YT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

/** Classify a channel input as a bare UC id or an @handle to resolve. */
export function parseChannelInput(
  input: string,
): { kind: "id" | "handle"; value: string } | null {
  const s = input.trim();
  if (!s) return null;
  let m = s.match(/^(UC[\w-]{20,})$/);
  if (m) return { kind: "id", value: m[1] };
  m = s.match(/youtube\.com\/channel\/(UC[\w-]{20,})/);
  if (m) return { kind: "id", value: m[1] };
  m = s.match(/youtube\.com\/@([\w.-]+)/);
  if (m) return { kind: "handle", value: m[1] };
  m = s.match(/^@?([\w.-]+)$/);
  if (m) return { kind: "handle", value: m[1] };
  return null;
}

/**
 * Turn a channel URL / @handle / UC-id into a concrete channel record by
 * fetching the public channel page server-side (full HTML, unlike client
 * scrapers). Throws a user-facing message when it can't be resolved.
 */
export async function resolveYouTubeChannel(
  input: string,
): Promise<ResolvedChannel> {
  const parsed = parseChannelInput(input);
  if (!parsed) {
    throw new Error("유효한 유튜브 채널 URL 또는 @핸들이 아닙니다.");
  }

  let channelId = "";
  const handle: string | null = parsed.kind === "handle" ? parsed.value : null;
  let title = "";
  let avatar: string | null = null;

  if (parsed.kind === "id") {
    channelId = parsed.value;
  } else {
    const res = await fetch(`https://www.youtube.com/@${parsed.value}`, {
      headers: { "User-Agent": YT_UA, "Accept-Language": "ko,en;q=0.9" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("채널 페이지를 불러오지 못했습니다.");
    const html = await res.text();
    const idM =
      html.match(/"channelId":"(UC[\w-]{20,})"/) ||
      html.match(/\/channel\/(UC[\w-]{20,})/) ||
      html.match(/"externalId":"(UC[\w-]{20,})"/);
    if (!idM) throw new Error("채널 ID를 찾지 못했습니다. URL을 확인해 주세요.");
    channelId = idM[1];
    const titleM = html.match(
      /<meta\s+property="og:title"\s+content="([^"]+)"/,
    );
    if (titleM) title = decodeHtmlEntities(titleM[1]);
    const avM = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
    if (avM) avatar = avM[1];
  }

  // Validate via RSS and backfill the title if the page didn't give one.
  const feed = await fetchChannelVideos(channelId, 1);
  if (!title && feed.title) title = feed.title;
  if (!title) title = handle ? `@${handle}` : channelId;

  return {
    channelId,
    handle,
    title,
    avatar,
    url: handle
      ? `https://www.youtube.com/@${handle}`
      : `https://www.youtube.com/channel/${channelId}`,
  };
}

/**
 * Recent uploads for a channel via its **uploads-playlist** Atom feed
 * (`playlist_id=UU…`). This is a single, simple path: one request, clean XML.
 * We use the uploads playlist rather than the channel feed because the channel
 * feed (`channel_id=…`) returns intermittent 500s for some channels.
 * On any failure we log a warning and return empty — easy to diagnose.
 * Cached upstream for 10 minutes.
 */
export async function fetchChannelVideos(
  channelId: string,
  limit = 12,
): Promise<{ title: string; videos: ChannelVideo[] }> {
  // A channel's uploads playlist id is its channel id with "UC" → "UU".
  const playlistId = channelId.startsWith("UC")
    ? `UU${channelId.slice(2)}`
    : channelId;
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;

  let xml = "";
  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": YT_UA },
      next: { revalidate: 600 },
    });
    if (res.ok) {
      xml = await res.text();
    } else {
      console.warn(`[media] YouTube feed ${res.status} for ${channelId} (${feedUrl})`);
    }
  } catch (e) {
    console.warn(`[media] YouTube feed fetch failed for ${channelId}:`, e);
  }

  // Feed-level <title> is the channel name (first <title> before any <entry>).
  const head = xml.split("<entry>")[0];
  const feedTitle = decodeHtmlEntities(
    head.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? "",
  );

  const entries = xml.split("<entry>").slice(1);
  const videos: ChannelVideo[] = [];
  for (const entry of entries.slice(0, limit)) {
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const rawTitle = entry.match(/<title>([^<]*)<\/title>/)?.[1];
    if (!videoId || !rawTitle) continue;
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    const thumb = entry.match(/<media:thumbnail\s+url="([^"]+)"/)?.[1];
    let publishedAt = 0;
    if (published) {
      const ms = Date.parse(published);
      if (!Number.isNaN(ms)) publishedAt = Math.floor(ms / 1000);
    }
    videos.push({
      videoId,
      title: decodeHtmlEntities(rawTitle),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumb: thumb || youTubeThumbnail(videoId),
      publishedAt,
    });
  }

  if (videos.length > 0) {
    // Live fetch succeeded — refresh the last-known-good cache (best-effort).
    await cacheChannelVideos(channelId, videos).catch(() => {});
    return { title: feedTitle, videos };
  }

  // Live fetch failed or returned nothing — fall back to cached uploads so a
  // transient YouTube outage doesn't make the registered channel disappear.
  const cached = await readCachedVideos(channelId).catch(() => []);
  if (cached.length > 0) {
    console.warn(`[media] serving ${cached.length} cached uploads for ${channelId}`);
    return { title: feedTitle, videos: cached.slice(0, limit) };
  }
  return { title: feedTitle, videos };
}

/** Persist the latest uploads for a channel; skips the write when unchanged. */
async function cacheChannelVideos(
  channelId: string,
  videos: ChannelVideo[],
): Promise<void> {
  await ensureMediaSchema();
  const db = getDb();
  const json = JSON.stringify(videos);
  const existing = await db.execute({
    sql: `SELECT videos FROM media_channel_videos WHERE channel_id = ?`,
    args: [channelId],
  });
  if (existing.rows[0] && String(existing.rows[0].videos) === json) return;
  await db.execute({
    sql: `INSERT INTO media_channel_videos (channel_id, videos, updated_at)
          VALUES (?, ?, unixepoch())
          ON CONFLICT(channel_id) DO UPDATE
            SET videos = excluded.videos, updated_at = excluded.updated_at`,
    args: [channelId, json],
  });
}

/** Read the last-known-good uploads for a channel (empty if none cached). */
async function readCachedVideos(channelId: string): Promise<ChannelVideo[]> {
  await ensureMediaSchema();
  const rs = await getDb().execute({
    sql: `SELECT videos FROM media_channel_videos WHERE channel_id = ?`,
    args: [channelId],
  });
  if (!rs.rows[0]) return [];
  try {
    const arr = JSON.parse(String(rs.rows[0].videos));
    return Array.isArray(arr) ? (arr as ChannelVideo[]) : [];
  } catch {
    return [];
  }
}

function mapChannelRow(row: Row): MediaChannel {
  return {
    id: Number(row.id),
    channelId: String(row.channel_id),
    handle: row.handle == null ? null : String(row.handle),
    title: String(row.title),
    avatar: row.avatar == null ? null : String(row.avatar),
    url: String(row.url),
    featured: Number(row.featured) === 1,
    published: Number(row.published) === 1,
    createdBy: row.created_by == null ? null : String(row.created_by),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

const SELECT_CHANNEL = `SELECT id, channel_id, handle, title, avatar, url,
                               featured, published, created_by, created_at, updated_at
                        FROM media_channels`;

export async function listAllChannels(): Promise<MediaChannel[]> {
  await ensureMediaSchema();
  const rs = await getDb().execute(
    `${SELECT_CHANNEL} ORDER BY featured DESC, created_at DESC`,
  );
  return rs.rows.map((r) => mapChannelRow(r as Row));
}

export async function listPublishedChannels(): Promise<MediaChannel[]> {
  await ensureMediaSchema();
  const rs = await getDb().execute(
    `${SELECT_CHANNEL} WHERE published = 1 ORDER BY featured DESC, created_at DESC`,
  );
  return rs.rows.map((r) => mapChannelRow(r as Row));
}

/** Register a channel (resolved upstream). Re-registering refreshes its meta. */
export async function createChannel(
  resolved: ResolvedChannel,
  createdBy: string | null,
): Promise<void> {
  await ensureMediaSchema();
  await getDb().execute({
    sql: `INSERT INTO media_channels
            (channel_id, handle, title, avatar, url, created_by)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(channel_id) DO UPDATE SET
            handle = excluded.handle,
            title = excluded.title,
            avatar = excluded.avatar,
            url = excluded.url,
            updated_at = unixepoch()`,
    args: [
      resolved.channelId,
      resolved.handle,
      resolved.title,
      resolved.avatar,
      resolved.url,
      createdBy,
    ],
  });
}

export async function deleteChannel(id: number): Promise<void> {
  await ensureMediaSchema();
  await getDb().execute({
    sql: `DELETE FROM media_channels WHERE id = ?`,
    args: [id],
  });
}

export async function setChannelFlag(
  id: number,
  flag: "published" | "featured",
  value: boolean,
): Promise<void> {
  await ensureMediaSchema();
  const column = flag === "published" ? "published" : "featured";
  await getDb().execute({
    sql: `UPDATE media_channels SET ${column} = ?, updated_at = unixepoch() WHERE id = ?`,
    args: [value ? 1 : 0, id],
  });
}
