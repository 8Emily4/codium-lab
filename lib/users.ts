import "server-only";
import { ensureSchema, getDb } from "@/lib/db";
import { getSession, type Role, type SessionUser } from "@/lib/auth";

/**
 * Super admins are defined ONLY via the SUPER_ADMIN_IDS env var
 * (comma-separated session ids, e.g. "kakao:123456,kakao:789").
 * They can never be granted or revoked through the database, so the
 * super-admin role can't be tampered with by editing user rows.
 */
export function getSuperAdminIds(): string[] {
  return (process.env.SUPER_ADMIN_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isEnvSuperAdmin(id: string): boolean {
  return getSuperAdminIds().includes(id);
}

export type ManagedUser = {
  id: string;
  provider: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: Role;
  createdAt: number;
  lastLoginAt: number;
};

/** Record (or refresh) a user when they log in. Never overwrites their role. */
export async function upsertUserOnLogin(user: SessionUser): Promise<void> {
  await ensureSchema();
  await getDb().execute({
    sql: `INSERT INTO users (id, provider, name, email, avatar, last_login_at)
          VALUES (?, ?, ?, ?, ?, unixepoch())
          ON CONFLICT(id) DO UPDATE SET
            provider = excluded.provider,
            name = excluded.name,
            email = excluded.email,
            avatar = excluded.avatar,
            last_login_at = unixepoch()`,
    args: [
      user.id,
      user.provider,
      user.name,
      user.email ?? null,
      user.avatar ?? null,
    ],
  });
}

/** Role stored in the DB — only "user" or "admin" (never superAdmin). */
async function getStoredRole(id: string): Promise<"user" | "admin"> {
  await ensureSchema();
  const rs = await getDb().execute({
    sql: `SELECT role FROM users WHERE id = ?`,
    args: [id],
  });
  return rs.rows[0]?.role === "admin" ? "admin" : "user";
}

/** Effective role: env super admin wins, otherwise the stored role. */
export async function resolveRole(id: string): Promise<Role> {
  if (isEnvSuperAdmin(id)) return "superAdmin";
  return getStoredRole(id);
}

export async function listUsers(): Promise<ManagedUser[]> {
  await ensureSchema();
  const rs = await getDb().execute(
    `SELECT id, provider, name, email, avatar, role, created_at, last_login_at
     FROM users ORDER BY last_login_at DESC`,
  );
  const superIds = new Set(getSuperAdminIds());
  return rs.rows.map((row) => {
    const id = String(row.id);
    const stored: "user" | "admin" = row.role === "admin" ? "admin" : "user";
    return {
      id,
      provider: String(row.provider),
      name: row.name == null ? null : String(row.name),
      email: row.email == null ? null : String(row.email),
      avatar: row.avatar == null ? null : String(row.avatar),
      role: superIds.has(id) ? "superAdmin" : stored,
      createdAt: Number(row.created_at),
      lastLoginAt: Number(row.last_login_at),
    };
  });
}

export async function setStoredRole(
  id: string,
  role: "admin" | "user",
): Promise<void> {
  await ensureSchema();
  await getDb().execute({
    sql: `UPDATE users SET role = ? WHERE id = ?`,
    args: [role, id],
  });
}

export type SessionWithRole = { session: SessionUser; role: Role };

/** Current session paired with its freshly-resolved effective role. */
export async function getSessionWithRole(): Promise<SessionWithRole | null> {
  const session = await getSession();
  if (!session) return null;
  return { session, role: await resolveRole(session.id) };
}

export function isAdminRole(role: Role): boolean {
  return role === "admin" || role === "superAdmin";
}

/**
 * Returns the current session only if the user is a super admin (resolved
 * fresh from env on each call, so it never trusts a stale cookie). Use this
 * to gate every super-admin-only page and server action.
 */
export async function requireSuperAdmin(): Promise<SessionUser | null> {
  const ctx = await getSessionWithRole();
  return ctx && ctx.role === "superAdmin" ? ctx.session : null;
}

/** Returns the session+role only for admins or super admins, else null. */
export async function requireAdmin(): Promise<SessionWithRole | null> {
  const ctx = await getSessionWithRole();
  return ctx && isAdminRole(ctx.role) ? ctx : null;
}

/** Returns the session+role for any logged-in user, else null. */
export async function requireUser(): Promise<SessionWithRole | null> {
  return getSessionWithRole();
}
