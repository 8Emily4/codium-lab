import "server-only";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { ensureSchema, getDb } from "@/lib/db";
import { getSession, type Role, type SessionUser } from "@/lib/auth";

/**
 * The super admin is defined ONLY by the env credentials
 * SUPER_ADMIN_EMAIL + SUPER_ADMIN_PASSWORD_HASH, which yield the session id
 * "local:<email>". It's never stored in the DB (so it can't be tampered with by
 * editing user rows) and is environment-stable — the same credentials work in
 * dev/QA/prod, unlike per-app Kakao member ids.
 */
export function getSuperAdminIds(): string[] {
  const credId = getCredentialAdminId();
  return credId ? [credId] : [];
}

export function isEnvSuperAdmin(id: string): boolean {
  return getSuperAdminIds().includes(id);
}

/* ── Credential (email/password) super admin ─────────────────────────── */

export function getCredentialAdminEmail(): string | null {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  return email || null;
}

/** Session id for the credential admin, e.g. "local:owner@example.com". */
export function getCredentialAdminId(): string | null {
  const email = getCredentialAdminEmail();
  return email ? `local:${email}` : null;
}

/** Verify a password against SUPER_ADMIN_PASSWORD_HASH ("scrypt:<salt>:<key>"). */
export function verifyAdminPassword(password: string): boolean {
  const stored = process.env.SUPER_ADMIN_PASSWORD_HASH?.trim();
  if (!stored || !password) return false;
  const [scheme, saltHex, keyHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  try {
    const expected = Buffer.from(keyHex, "hex");
    const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/** True only when both the email matches and the password verifies. */
export function verifyAdminCredentials(email: string, password: string): boolean {
  const adminEmail = getCredentialAdminEmail();
  if (!adminEmail) return false;
  if (email.trim().toLowerCase() !== adminEmail) return false;
  return verifyAdminPassword(password);
}

export type ManagedUser = {
  id: string;
  provider: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: Role;
  /** True for the env-defined root super admin, whose role can't be changed. */
  envSuper: boolean;
  /** Host the user last logged in through, e.g. "localhost:3000" / "codiumlab.ai.kr". */
  lastLoginHost: string | null;
  createdAt: number;
  lastLoginAt: number;
};

/**
 * Record (or refresh) a user when they log in. Never overwrites their role.
 * `loginHost` is the host they came in through, so the same person logging in
 * from local dev vs production (which Kakao assigns different ids to) can be
 * told apart in the admin list.
 */
export async function upsertUserOnLogin(
  user: SessionUser,
  loginHost?: string | null,
): Promise<void> {
  await ensureSchema();
  await getDb().execute({
    sql: `INSERT INTO users (id, provider, name, email, avatar, last_login_at, last_login_host)
          VALUES (?, ?, ?, ?, ?, unixepoch(), ?)
          ON CONFLICT(id) DO UPDATE SET
            provider = excluded.provider,
            name = excluded.name,
            email = excluded.email,
            avatar = excluded.avatar,
            last_login_at = unixepoch(),
            last_login_host = excluded.last_login_host`,
    args: [
      user.id,
      user.provider,
      user.name,
      user.email ?? null,
      user.avatar ?? null,
      loginHost ?? null,
    ],
  });
}

/** Permanently remove a user and any material grants tied to them. */
export async function deleteUser(id: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `DELETE FROM material_grants WHERE user_id = ?`,
    args: [id],
  });
  await db.execute({ sql: `DELETE FROM users WHERE id = ?`, args: [id] });
}

/**
 * Role stored in the DB. A super admin can promote others to "superAdmin"
 * (persisted here), so this may return any role. The env root super admin is
 * resolved separately and always wins.
 */
function parseRole(raw: unknown): Role {
  if (raw === "superAdmin") return "superAdmin";
  if (raw === "admin") return "admin";
  return "user";
}

async function getStoredRole(id: string): Promise<Role> {
  await ensureSchema();
  const rs = await getDb().execute({
    sql: `SELECT role FROM users WHERE id = ?`,
    args: [id],
  });
  return parseRole(rs.rows[0]?.role);
}

/** Effective role: env super admin wins, otherwise the stored role. */
export async function resolveRole(id: string): Promise<Role> {
  if (isEnvSuperAdmin(id)) return "superAdmin";
  return getStoredRole(id);
}

export async function listUsers(): Promise<ManagedUser[]> {
  await ensureSchema();
  const rs = await getDb().execute(
    `SELECT id, provider, name, email, avatar, role, created_at, last_login_at, last_login_host
     FROM users ORDER BY last_login_at DESC`,
  );
  const superIds = new Set(getSuperAdminIds());
  return rs.rows.map((row) => {
    const id = String(row.id);
    const envSuper = superIds.has(id);
    return {
      id,
      provider: String(row.provider),
      name: row.name == null ? null : String(row.name),
      email: row.email == null ? null : String(row.email),
      avatar: row.avatar == null ? null : String(row.avatar),
      role: envSuper ? "superAdmin" : parseRole(row.role),
      envSuper,
      lastLoginHost:
        row.last_login_host == null ? null : String(row.last_login_host),
      createdAt: Number(row.created_at),
      lastLoginAt: Number(row.last_login_at),
    };
  });
}

/**
 * Persist a user's role. Super admins may grant "admin" or "superAdmin"; the
 * env root super admin is enforced by callers (it must never be downgraded
 * here, since the DB row is ignored for it anyway).
 */
export async function setStoredRole(id: string, role: Role): Promise<void> {
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
