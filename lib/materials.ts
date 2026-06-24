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

/** A material as seen by a viewer, plus how/why they can see it. */
export type ViewerMaterial = MaterialListItem & {
  via: "admin" | "public" | "grant";
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
 * Materials a given viewer is allowed to see.
 * - admins/super admins: everything
 * - everyone else: published materials that are either public or actively granted
 */
export async function listMaterialsForViewer(
  userId: string,
  role: Role,
): Promise<ViewerMaterial[]> {
  await ensureSchema();
  if (isAdminRole(role)) {
    const all = await listAllMaterials();
    return all.map((m) => ({ ...m, via: "admin", accessEndsAt: null }));
  }
  const now = nowSeconds();
  const rs = await getDb().execute({
    sql: `
      SELECT m.*, g.ends_at AS grant_ends_at,
        CASE WHEN m.access = 'public' THEN 'public' ELSE 'grant' END AS via
      FROM materials m
      LEFT JOIN material_grants g
        ON g.material_id = m.id AND g.user_id = ?1
        AND (g.starts_at IS NULL OR g.starts_at <= ?2)
        AND (g.ends_at IS NULL OR g.ends_at >= ?2)
      WHERE m.status = 'published'
        AND (m.access = 'public' OR g.id IS NOT NULL)
      ORDER BY m.updated_at DESC
    `,
    args: [userId, now],
  });
  return rs.rows.map((row) => ({
    ...toListItem(row),
    via: (row.via === "public" ? "public" : "grant") as "public" | "grant",
    accessEndsAt: row.grant_ends_at == null ? null : Number(row.grant_ends_at),
  }));
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
            (id, title, summary, body, status, access, category, tags, author_id, author_name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.title,
      input.summary ?? null,
      input.body ?? "",
      input.status ?? "draft",
      input.access ?? "restricted",
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
