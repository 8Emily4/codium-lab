import "server-only";
import { getDb } from "@/lib/db";

/**
 * 기술블로그 — 관리자가 워크스페이스에서 마크다운으로 글을 작성하면
 * /blog 목록과 /blog/[slug] 상세에 노출됩니다. 데이터는 Turso(libSQL)에 저장됩니다.
 * media.ts / materials.ts 패턴을 그대로 따릅니다.
 */

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  /** Markdown source rendered on the detail page. */
  body: string;
  thumbnail: string | null;
  tags: string[];
  featured: boolean;
  published: boolean;
  authorId: string | null;
  authorName: string | null;
  createdAt: number;
  updatedAt: number;
};

/** List rows skip the (potentially large) markdown body. */
export type BlogListItem = Omit<BlogPost, "body">;

let migrated = false;

export async function ensureBlogSchema(): Promise<void> {
  if (migrated) return;
  await getDb().execute(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT,
      body TEXT NOT NULL DEFAULT '',
      thumbnail TEXT,
      tags TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      author_id TEXT,
      author_name TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  migrated = true;
}

/* ------------------------------------------------------------------ */
/* Slug helpers                                                        */
/* ------------------------------------------------------------------ */

/** Unicode-aware slug: keeps Hangul, collapses everything else to hyphens. */
export function slugify(input: string): string {
  return input
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** Resolve a unique slug, appending -2, -3… on collisions (ignoring excludeId). */
async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  await ensureBlogSchema();
  const db = getDb();
  const root = base || "post";
  let candidate = root;
  let n = 1;
  // Small blog — only collides a handful of times in the worst case.
  for (;;) {
    const rs = await db.execute({
      sql: `SELECT id FROM blog_posts WHERE slug = ?`,
      args: [candidate],
    });
    const row = rs.rows[0];
    if (!row || (excludeId != null && Number(row.id) === excludeId)) {
      return candidate;
    }
    n += 1;
    candidate = `${root}-${n}`;
  }
}

/* ------------------------------------------------------------------ */
/* Mapping + queries                                                   */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

function toTags(v: unknown): string[] {
  const raw = v == null ? "" : String(v);
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function mapList(row: Row): BlogListItem {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    summary: row.summary == null ? null : String(row.summary),
    thumbnail: row.thumbnail == null ? null : String(row.thumbnail),
    tags: toTags(row.tags),
    featured: Number(row.featured) === 1,
    published: Number(row.published) === 1,
    authorId: row.author_id == null ? null : String(row.author_id),
    authorName: row.author_name == null ? null : String(row.author_name),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function mapFull(row: Row): BlogPost {
  return { ...mapList(row), body: row.body == null ? "" : String(row.body) };
}

const LIST_COLS = `id, slug, title, summary, thumbnail, tags, featured,
                   published, author_id, author_name, created_at, updated_at`;
const FULL_COLS = `${LIST_COLS}, body`;

/** Public list: published only, featured pinned first, then newest. */
export async function listPublishedPosts(): Promise<BlogListItem[]> {
  await ensureBlogSchema();
  const rs = await getDb().execute(
    `SELECT ${LIST_COLS} FROM blog_posts WHERE published = 1
     ORDER BY featured DESC, created_at DESC`,
  );
  return rs.rows.map((r) => mapList(r as Row));
}

/** Admin list: every post, drafts included, with body for editing. */
export async function listAllPosts(): Promise<BlogPost[]> {
  await ensureBlogSchema();
  const rs = await getDb().execute(
    `SELECT ${FULL_COLS} FROM blog_posts
     ORDER BY featured DESC, created_at DESC`,
  );
  return rs.rows.map((r) => mapFull(r as Row));
}

/** Public detail: published post by slug, or null. */
export async function getPublishedPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  await ensureBlogSchema();
  const rs = await getDb().execute({
    sql: `SELECT ${FULL_COLS} FROM blog_posts WHERE slug = ? AND published = 1 LIMIT 1`,
    args: [slug],
  });
  const row = rs.rows[0];
  return row ? mapFull(row as Row) : null;
}

export type BlogInput = {
  title: string;
  /** Optional custom slug; derived from the title when blank. */
  slug?: string | null;
  summary?: string | null;
  body: string;
  thumbnail?: string | null;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
};

function normalizeTags(tags: string[] | undefined): string {
  if (!tags) return "";
  return tags.map((t) => t.trim()).filter(Boolean).join(", ");
}

export async function createPost(
  input: BlogInput,
  author: { id: string | null; name: string | null },
): Promise<string> {
  await ensureBlogSchema();
  const slug = await uniqueSlug(slugify(input.slug?.trim() || input.title));
  await getDb().execute({
    sql: `INSERT INTO blog_posts
            (slug, title, summary, body, thumbnail, tags, featured, published, author_id, author_name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      slug,
      input.title,
      input.summary?.trim() || null,
      input.body ?? "",
      input.thumbnail?.trim() || null,
      normalizeTags(input.tags),
      input.featured ? 1 : 0,
      input.published === false ? 0 : 1,
      author.id,
      author.name,
    ],
  });
  return slug;
}

export async function updatePost(id: number, input: BlogInput): Promise<string> {
  await ensureBlogSchema();
  const slug = await uniqueSlug(slugify(input.slug?.trim() || input.title), id);
  await getDb().execute({
    sql: `UPDATE blog_posts SET
            slug = ?, title = ?, summary = ?, body = ?, thumbnail = ?,
            tags = ?, featured = ?, published = ?, updated_at = unixepoch()
          WHERE id = ?`,
    args: [
      slug,
      input.title,
      input.summary?.trim() || null,
      input.body ?? "",
      input.thumbnail?.trim() || null,
      normalizeTags(input.tags),
      input.featured ? 1 : 0,
      input.published === false ? 0 : 1,
      id,
    ],
  });
  return slug;
}

export async function deletePost(id: number): Promise<void> {
  await ensureBlogSchema();
  await getDb().execute({
    sql: `DELETE FROM blog_posts WHERE id = ?`,
    args: [id],
  });
}

/** Flip a single boolean flag (published / featured) without a full edit. */
export async function setPostFlag(
  id: number,
  flag: "published" | "featured",
  value: boolean,
): Promise<void> {
  await ensureBlogSchema();
  const column = flag === "published" ? "published" : "featured";
  await getDb().execute({
    sql: `UPDATE blog_posts SET ${column} = ?, updated_at = unixepoch() WHERE id = ?`,
    args: [value ? 1 : 0, id],
  });
}
