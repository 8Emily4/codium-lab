import "server-only";
import { randomUUID } from "node:crypto";
import type { Row } from "@libsql/client";
import { ensureSchema, getDb } from "@/lib/db";
import type { Role } from "@/lib/auth";
import { isAdminRole } from "@/lib/users";

export type MaterialStatus = "draft" | "published" | "archived";
export type MaterialAccess = "public" | "restricted";

export type Material = {
  id: string;
  title: string;
  summary: string | null;
  body: string;
  status: MaterialStatus;
  access: MaterialAccess;
  /** 유료(access=restricted) 자료의 가격(원). 무료/미설정이면 null. */
  price: number | null;
  category: string | null;
  tags: string[];
  authorId: string | null;
  authorName: string | null;
  createdAt: number;
  updatedAt: number;
};

export type MaterialListItem = Omit<Material, "body"> & {
  bodyPreview: string;
  grantCount?: number;
};

/**
 * Whether a viewer can actually read a material right now.
 * - "open": admin, public, or an active grant → full body
 * - "locked": a restricted (paid) material the viewer holds no grant for →
 *   title + a short teaser only, advertising that a paid course exists
 * - "expired": had a grant whose window has ended → title + teaser + locked notice
 * - "upcoming": granted but the window hasn't started yet → title + teaser + notice
 */
export type ViewerAccessState = "open" | "locked" | "expired" | "upcoming";

/**
 * How much of the body to reveal as a teaser for a locked material. Cut on the
 * SERVER so the rest never reaches the browser — not even via "view source".
 */
const TEASER_CHARS = 300;

/** First few lines of the body, cut on a word/line boundary near TEASER_CHARS. */
function teaserOf(body: string): string {
  if (body.length <= TEASER_CHARS) return body;
  const raw = body.slice(0, TEASER_CHARS + 20);
  const nl = raw.lastIndexOf("\n");
  const cut = nl > 120 ? nl : raw.lastIndexOf(" ");
  return (cut > 120 ? raw.slice(0, cut) : raw.slice(0, TEASER_CHARS)).trimEnd();
}

/** A material as seen by a viewer, plus how/why they can see it. */
export type ViewerMaterial = MaterialListItem & {
  via: "admin" | "public" | "grant";
  accessState: ViewerAccessState;
  accessStartsAt: number | null;
  accessEndsAt: number | null;
};

export type Grant = {
  id: string;
  materialId: string;
  userId: string;
  startsAt: number | null;
  endsAt: number | null;
  grantedBy: string | null;
  createdAt: number;
};

export type GrantWithUser = Grant & {
  userName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
  active: boolean;
};

const VALID_STATUS: MaterialStatus[] = ["draft", "published", "archived"];
const VALID_ACCESS: MaterialAccess[] = ["public", "restricted"];

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function str(v: unknown): string | null {
  return v == null ? null : String(v);
}

function parseTags(v: unknown): string[] {
  if (v == null) return [];
  try {
    const arr = JSON.parse(String(v));
    return Array.isArray(arr) ? arr.map((t) => String(t)) : [];
  } catch {
    return [];
  }
}

function toMaterial(row: Row): Material {
  return {
    id: String(row.id),
    title: String(row.title),
    summary: str(row.summary),
    body: String(row.body ?? ""),
    status: (VALID_STATUS.includes(row.status as MaterialStatus)
      ? row.status
      : "draft") as MaterialStatus,
    access: (VALID_ACCESS.includes(row.access as MaterialAccess)
      ? row.access
      : "restricted") as MaterialAccess,
    price: row.price == null ? null : Number(row.price),
    category: str(row.category),
    tags: parseTags(row.tags),
    authorId: str(row.author_id),
    authorName: str(row.author_name),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function toListItem(row: Row): MaterialListItem {
  const m = toMaterial(row);
  const { body, ...rest } = m;
  return { ...rest, bodyPreview: body.slice(0, 200) };
}

// ── Reads ────────────────────────────────────────────────────────────────

/** Full catalogue for admins, newest first, with grant counts. */
export async function listAllMaterials(): Promise<MaterialListItem[]> {
  await ensureSchema();
  const rs = await getDb().execute(`
    SELECT m.*,
      (SELECT COUNT(*) FROM material_grants g WHERE g.material_id = m.id) AS grant_count
    FROM materials m
    ORDER BY m.updated_at DESC
  `);
  return rs.rows.map((row) => ({
    ...toListItem(row),
    grantCount: Number(row.grant_count ?? 0),
  }));
}

/**
 * Materials a given viewer can see in their list.
 * - admins/super admins: everything (always "open")
 * - everyone else: every published material. Public ones and active grants are
 *   "open" (full body). Restricted ones with no/expired/upcoming grant are
 *   shown by title + a short server-cut teaser ("locked"/"expired"/"upcoming")
 *   so the reader knows a paid course exists; the rest of the body is withheld.
 */
export async function listMaterialsForViewer(
  userId: string,
  role: Role,
): Promise<ViewerMaterial[]> {
  await ensureSchema();
  if (isAdminRole(role)) {
    const all = await listAllMaterials();
    return all.map((m) => ({
      ...m,
      via: "admin",
      accessState: "open",
      accessStartsAt: null,
      accessEndsAt: null,
    }));
  }
  const now = nowSeconds();
  const rs = await getDb().execute({
    sql: `
      SELECT m.*,
        g.id AS grant_id,
        g.starts_at AS grant_starts_at,
        g.ends_at AS grant_ends_at
      FROM materials m
      LEFT JOIN material_grants g
        ON g.material_id = m.id AND g.user_id = ?1
      WHERE m.status = 'published'
      ORDER BY m.updated_at DESC
    `,
    args: [userId],
  });
  const items = rs.rows.map((row) => {
    const item = toListItem(row);
    // Public materials are always open to any logged-in user.
    if (row.access === "public") {
      return {
        ...item,
        via: "public" as const,
        accessState: "open" as const,
        accessStartsAt: null,
        accessEndsAt: null,
      };
    }
    // restricted (paid). No grant row at all → "locked" teaser.
    const hasGrant = row.grant_id != null;
    const startsAt = row.grant_starts_at == null ? null : Number(row.grant_starts_at);
    const endsAt = row.grant_ends_at == null ? null : Number(row.grant_ends_at);
    const started = startsAt == null || startsAt <= now;
    const notEnded = endsAt == null || endsAt >= now;
    const accessState: ViewerAccessState = !hasGrant
      ? "locked"
      : started
        ? notEnded
          ? "open"
          : "expired"
        : "upcoming";
    return {
      ...item,
      // Locked materials reveal only a short teaser, cut on the server so the
      // rest of the body never reaches the browser.
      bodyPreview:
        accessState === "open" ? item.bodyPreview : teaserOf(String(row.body ?? "")),
      via: hasGrant ? ("grant" as const) : ("public" as const),
      accessState,
      accessStartsAt: startsAt,
      accessEndsAt: endsAt,
    };
  });
  // Order for the reader: subscribed & readable first, then subscriptions that
  // haven't started, then expired ones, and unsubscribed (paid) at the bottom.
  // Stable sort keeps the SQL "updated_at DESC" order within each group.
  const RANK: Record<ViewerAccessState, number> = {
    open: 0,
    upcoming: 1,
    expired: 2,
    locked: 3,
  };
  return items.sort((a, b) => RANK[a.accessState] - RANK[b.accessState]);
}

/** Raw fetch by id (no access check) — admin/editor use. */
export async function getMaterial(id: string): Promise<Material | null> {
  await ensureSchema();
  const rs = await getDb().execute({
    sql: `SELECT * FROM materials WHERE id = ?`,
    args: [id],
  });
  return rs.rows[0] ? toMaterial(rs.rows[0]) : null;
}

/** Fetch by id only if the viewer is allowed to read it, else null. */
export async function getMaterialForViewer(
  id: string,
  userId: string,
  role: Role,
): Promise<Material | null> {
  const material = await getMaterial(id);
  if (!material) return null;
  if (isAdminRole(role)) return material;
  if (material.status !== "published") return null;
  if (material.access === "public") return material;
  // restricted → require an active grant
  const now = nowSeconds();
  const rs = await getDb().execute({
    sql: `SELECT 1 FROM material_grants
          WHERE material_id = ?1 AND user_id = ?2
            AND (starts_at IS NULL OR starts_at <= ?3)
            AND (ends_at IS NULL OR ends_at >= ?3)
          LIMIT 1`,
    args: [id, userId, now],
  });
  return rs.rows[0] ? material : null;
}

// ── Writes (admin) ─────────────────────────────────────────────────────────

export type MaterialInput = {
  title: string;
  summary?: string | null;
  body?: string;
  status?: MaterialStatus;
  access?: MaterialAccess;
  price?: number | null;
  category?: string | null;
  tags?: string[];
  authorId?: string | null;
  authorName?: string | null;
};

export async function createMaterial(input: MaterialInput): Promise<string> {
  await ensureSchema();
  const id = randomUUID();
  await getDb().execute({
    sql: `INSERT INTO materials
            (id, title, summary, body, status, access, price, category, tags, author_id, author_name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.title,
      input.summary ?? null,
      input.body ?? "",
      input.status ?? "draft",
      input.access ?? "restricted",
      input.price ?? null,
      input.category ?? null,
      JSON.stringify(input.tags ?? []),
      input.authorId ?? null,
      input.authorName ?? null,
    ],
  });
  return id;
}

export async function updateMaterial(
  id: string,
  patch: Partial<MaterialInput>,
): Promise<void> {
  await ensureSchema();
  const sets: string[] = [];
  const args: (string | number | null)[] = [];
  const push = (col: string, val: string | number | null) => {
    sets.push(`${col} = ?`);
    args.push(val);
  };
  if (patch.title !== undefined) push("title", patch.title);
  if (patch.summary !== undefined) push("summary", patch.summary ?? null);
  if (patch.body !== undefined) push("body", patch.body);
  if (patch.status !== undefined) push("status", patch.status);
  if (patch.access !== undefined) push("access", patch.access);
  if (patch.price !== undefined) push("price", patch.price ?? null);
  if (patch.category !== undefined) push("category", patch.category ?? null);
  if (patch.tags !== undefined) push("tags", JSON.stringify(patch.tags));
  if (sets.length === 0) return;
  push("updated_at", nowSeconds());
  args.push(id);
  await getDb().execute({
    sql: `UPDATE materials SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function setMaterialStatus(
  id: string,
  status: MaterialStatus,
): Promise<void> {
  await updateMaterial(id, { status });
}

export async function deleteMaterial(id: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `DELETE FROM material_grants WHERE material_id = ?`,
    args: [id],
  });
  await db.execute({ sql: `DELETE FROM materials WHERE id = ?`, args: [id] });
}

// ── Grants (admin) ───────────────────────────────────────────────────────

export async function listGrants(materialId: string): Promise<GrantWithUser[]> {
  await ensureSchema();
  const now = nowSeconds();
  const rs = await getDb().execute({
    sql: `
      SELECT g.*, u.name AS user_name, u.email AS user_email, u.avatar AS user_avatar
      FROM material_grants g
      LEFT JOIN users u ON u.id = g.user_id
      WHERE g.material_id = ?
      ORDER BY g.created_at DESC
    `,
    args: [materialId],
  });
  return rs.rows.map((row) => {
    const startsAt = row.starts_at == null ? null : Number(row.starts_at);
    const endsAt = row.ends_at == null ? null : Number(row.ends_at);
    const active =
      (startsAt == null || startsAt <= now) && (endsAt == null || endsAt >= now);
    return {
      id: String(row.id),
      materialId: String(row.material_id),
      userId: String(row.user_id),
      startsAt,
      endsAt,
      grantedBy: str(row.granted_by),
      createdAt: Number(row.created_at),
      userName: str(row.user_name),
      userEmail: str(row.user_email),
      userAvatar: str(row.user_avatar),
      active,
    };
  });
}

/** Create or replace the grant for (material, user). */
export async function upsertGrant(params: {
  materialId: string;
  userId: string;
  startsAt: number | null;
  endsAt: number | null;
  grantedBy: string | null;
}): Promise<void> {
  await ensureSchema();
  await getDb().execute({
    sql: `INSERT INTO material_grants
            (id, material_id, user_id, starts_at, ends_at, granted_by)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(material_id, user_id) DO UPDATE SET
            starts_at = excluded.starts_at,
            ends_at = excluded.ends_at,
            granted_by = excluded.granted_by`,
    args: [
      randomUUID(),
      params.materialId,
      params.userId,
      params.startsAt,
      params.endsAt,
      params.grantedBy,
    ],
  });
}

export async function revokeGrant(
  materialId: string,
  userId: string,
): Promise<void> {
  await ensureSchema();
  await getDb().execute({
    sql: `DELETE FROM material_grants WHERE material_id = ? AND user_id = ?`,
    args: [materialId, userId],
  });
}
