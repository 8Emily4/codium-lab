import "server-only";
import { getDb } from "@/lib/db";

/**
 * "재미있는 콘텐츠" 갤러리 — 관리자가 워크스페이스에서 이미지를 업로드하거나
 * 영상(YouTube) 링크를 등록하면 /gallery 페이지에 모든 방문자에게 노출됩니다.
 *
 * 이미지 바이트는 Turso(libSQL)에 BLOB 으로 저장하고, `/api/gallery/[id]` 라우트가
 * 스트리밍합니다. 목록 쿼리는 바이트를 절대 싣지 않아(메타데이터만) 가볍습니다.
 */

export type GalleryKind = "image" | "video";

export const GALLERY_KINDS: GalleryKind[] = ["image", "video"];

export function isGalleryKind(v: unknown): v is GalleryKind {
  return typeof v === "string" && (GALLERY_KINDS as string[]).includes(v);
}

/** 목록/카드용 메타데이터. 이미지 바이트(image_data)는 포함하지 않습니다. */
export type GalleryItem = {
  id: number;
  kind: GalleryKind;
  title: string;
  description: string | null;
  /** 이미지 전용: 저장된 MIME 과 원본 비율(레이아웃용). */
  mime: string | null;
  width: number | null;
  height: number | null;
  /** 영상 전용: YouTube 시청 URL. */
  videoUrl: string | null;
  featured: boolean;
  published: boolean;
  createdBy: string | null;
  createdAt: number;
  updatedAt: number;
};

let migrated = false;

export async function ensureGallerySchema(): Promise<void> {
  if (migrated) return;
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL DEFAULT 'image',
      title TEXT NOT NULL,
      description TEXT,
      image_data BLOB,
      mime TEXT,
      width INTEGER,
      height INTEGER,
      video_url TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      created_by TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  migrated = true;
}

/* ------------------------------------------------------------------ */
/* Mapping + queries                                                   */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

function mapRow(row: Row): GalleryItem {
  return {
    id: Number(row.id),
    kind: isGalleryKind(row.kind) ? row.kind : "image",
    title: String(row.title),
    description: row.description == null ? null : String(row.description),
    mime: row.mime == null ? null : String(row.mime),
    width: row.width == null ? null : Number(row.width),
    height: row.height == null ? null : Number(row.height),
    videoUrl: row.video_url == null ? null : String(row.video_url),
    featured: Number(row.featured) === 1,
    published: Number(row.published) === 1,
    createdBy: row.created_by == null ? null : String(row.created_by),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

// 의도적으로 image_data 를 제외 — 목록을 가볍게 유지합니다.
const SELECT_META = `SELECT id, kind, title, description, mime, width, height,
                            video_url, featured, published, created_by,
                            created_at, updated_at
                     FROM gallery_items`;

/** 공개 페이지: 노출된 항목만, 추천 우선 → 최신순. */
export async function listPublishedGallery(): Promise<GalleryItem[]> {
  await ensureGallerySchema();
  const rs = await getDb().execute(
    `${SELECT_META} WHERE published = 1 ORDER BY featured DESC, created_at DESC`,
  );
  return rs.rows.map((r) => mapRow(r as Row));
}

/** 관리자 페이지: 숨김 포함 전체. */
export async function listAllGallery(): Promise<GalleryItem[]> {
  await ensureGallerySchema();
  const rs = await getDb().execute(
    `${SELECT_META} ORDER BY featured DESC, created_at DESC`,
  );
  return rs.rows.map((r) => mapRow(r as Row));
}

export type GalleryImageBytes = {
  data: Uint8Array;
  mime: string;
  updatedAt: number;
};

/** `/api/gallery/[id]` 라우트용 — 이미지 바이트 + MIME 을 읽어옵니다. */
export async function getGalleryImage(
  id: number,
): Promise<GalleryImageBytes | null> {
  await ensureGallerySchema();
  const rs = await getDb().execute({
    sql: `SELECT image_data, mime, updated_at FROM gallery_items
          WHERE id = ? AND kind = 'image'`,
    args: [id],
  });
  const row = rs.rows[0];
  if (!row || row.image_data == null) return null;

  const raw = row.image_data as unknown;
  let data: Uint8Array;
  if (raw instanceof Uint8Array) data = raw;
  else if (raw instanceof ArrayBuffer) data = new Uint8Array(raw);
  else return null;

  return {
    data,
    mime: row.mime == null ? "application/octet-stream" : String(row.mime),
    updatedAt: Number(row.updated_at),
  };
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

export type GalleryImageInput = {
  title: string;
  description?: string | null;
  data: Uint8Array;
  mime: string;
  width: number;
  height: number;
  featured?: boolean;
  published?: boolean;
};

export async function createGalleryImage(
  input: GalleryImageInput,
  createdBy: string | null,
): Promise<void> {
  await ensureGallerySchema();
  await getDb().execute({
    sql: `INSERT INTO gallery_items
            (kind, title, description, image_data, mime, width, height,
             featured, published, created_by)
          VALUES ('image', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.title,
      input.description?.trim() || null,
      input.data,
      input.mime,
      input.width,
      input.height,
      input.featured ? 1 : 0,
      input.published === false ? 0 : 1,
      createdBy,
    ],
  });
}

export type GalleryVideoInput = {
  title: string;
  description?: string | null;
  videoUrl: string;
  featured?: boolean;
  published?: boolean;
};

export async function createGalleryVideo(
  input: GalleryVideoInput,
  createdBy: string | null,
): Promise<void> {
  await ensureGallerySchema();
  await getDb().execute({
    sql: `INSERT INTO gallery_items
            (kind, title, description, video_url, featured, published, created_by)
          VALUES ('video', ?, ?, ?, ?, ?, ?)`,
    args: [
      input.title,
      input.description?.trim() || null,
      input.videoUrl,
      input.featured ? 1 : 0,
      input.published === false ? 0 : 1,
      createdBy,
    ],
  });
}

export type GalleryMetaInput = {
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  featured?: boolean;
  published?: boolean;
};

/** 제목/설명/플래그(+영상 URL) 수정 — 이미지 바이트는 건드리지 않습니다. */
export async function updateGalleryMeta(
  id: number,
  input: GalleryMetaInput,
): Promise<void> {
  await ensureGallerySchema();
  await getDb().execute({
    sql: `UPDATE gallery_items SET
            title = ?, description = ?, video_url = ?,
            featured = ?, published = ?, updated_at = unixepoch()
          WHERE id = ?`,
    args: [
      input.title,
      input.description?.trim() || null,
      input.videoUrl?.trim() || null,
      input.featured ? 1 : 0,
      input.published === false ? 0 : 1,
      id,
    ],
  });
}

/** 기존 이미지 항목의 바이트를 새 파일로 교체합니다. */
export async function replaceGalleryImage(
  id: number,
  data: Uint8Array,
  mime: string,
  width: number,
  height: number,
): Promise<void> {
  await ensureGallerySchema();
  await getDb().execute({
    sql: `UPDATE gallery_items SET
            image_data = ?, mime = ?, width = ?, height = ?,
            updated_at = unixepoch()
          WHERE id = ? AND kind = 'image'`,
    args: [data, mime, width, height, id],
  });
}

export async function deleteGalleryItem(id: number): Promise<void> {
  await ensureGallerySchema();
  await getDb().execute({
    sql: `DELETE FROM gallery_items WHERE id = ?`,
    args: [id],
  });
}

/** 전체 편집 없이 단일 불리언 플래그(published / featured)만 토글. */
export async function setGalleryFlag(
  id: number,
  flag: "published" | "featured",
  value: boolean,
): Promise<void> {
  await ensureGallerySchema();
  const column = flag === "published" ? "published" : "featured";
  await getDb().execute({
    sql: `UPDATE gallery_items SET ${column} = ?, updated_at = unixepoch() WHERE id = ?`,
    args: [value ? 1 : 0, id],
  });
}
