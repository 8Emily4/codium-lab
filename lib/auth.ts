import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

export type Role = "user" | "admin" | "superAdmin";

export type SessionUser = {
  id: string;
  // "local" = email/password super-admin login (no social provider).
  provider: "kakao" | "naver" | "google" | "meta" | "local";
  name: string;
  email?: string;
  avatar?: string;
  role?: Role;
  issuedAt: number;
};

const COOKIE_NAME = "codium_session";
const STATE_COOKIE = "codium_oauth_state";
const ALG = "HS256";

/** Access-token lifetime in minutes (default 7 days). Aligns with code-pulse. */
function getExpireMinutes(): number {
  const v = Number(process.env.JWT_ACCESS_EXPIRE_MINUTES);
  return Number.isFinite(v) && v > 0 ? v : 60 * 24 * 7;
}

/** HS256 signing key. Prefers JWT_SECRET_KEY, falls back to AUTH_SECRET. */
function getSecretKey(): Uint8Array {
  const s = process.env.JWT_SECRET_KEY || process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "JWT_SECRET_KEY is missing or too short (need 32+ chars). Generate with `openssl rand -base64 48`.",
    );
  }
  return new TextEncoder().encode(s);
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/** Sign the session as a standard JWT (sub + custom claims, HS256). */
export async function encodeSession(user: SessionUser): Promise<string> {
  return await new SignJWT({
    type: "access",
    provider: user.provider,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  })
    .setProtectedHeader({ alg: ALG, typ: "JWT" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${getExpireMinutes()}m`)
    .sign(getSecretKey());
}

/** Verify + decode the JWT back into a SessionUser, or null if invalid/expired. */
export async function decodeSession(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: [ALG],
    });
    if (!payload.sub) return null;
    return {
      id: String(payload.sub),
      provider: (payload.provider as SessionUser["provider"]) ?? "kakao",
      name: String(payload.name ?? ""),
      email: (payload.email as string | undefined) ?? undefined,
      avatar: (payload.avatar as string | undefined) ?? undefined,
      role: payload.role as Role | undefined,
      issuedAt: typeof payload.iat === "number" ? payload.iat * 1000 : Date.now(),
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  return decodeSession(jar.get(COOKIE_NAME)?.value);
}

export async function setSession(user: SessionUser) {
  const jar = await cookies();
  const token = await encodeSession(user);
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getExpireMinutes() * 60,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function setStateCookie(state: string) {
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10 min
  });
}

export async function readAndClearStateCookie(): Promise<string | null> {
  const jar = await cookies();
  const v = jar.get(STATE_COOKIE)?.value ?? null;
  jar.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return v;
}

export function generateState(): string {
  return b64url(randomBytes(24));
}
