import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { recordVisit } from "@/lib/analytics";

export const runtime = "nodejs";

const VISITOR_COOKIE = "codium_vid";
const ONE_YEAR = 60 * 60 * 24 * 365;

type Body = {
  path?: unknown;
  referrer?: unknown;
  utmSource?: unknown;
  lang?: unknown;
};

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

/** Internal areas that shouldn't count as public visits. */
function isTrackablePath(path: string): boolean {
  return (
    path.startsWith("/") &&
    !path.includes("/work") &&
    !path.startsWith("/login") &&
    !path.startsWith("/api")
  );
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = str(body.path, 300);
  if (!path || !isTrackablePath(path)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const jar = await cookies();
  let visitorId = jar.get(VISITOR_COOKIE)?.value;
  if (!visitorId) {
    visitorId = randomUUID();
    jar.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_YEAR,
      path: "/",
    });
  }

  try {
    await recordVisit({
      visitorId,
      path,
      referrer: str(body.referrer, 500),
      utmSource: str(body.utmSource, 120),
      lang: str(body.lang, 8),
    });
  } catch {
    // Analytics must never break a page view — swallow DB hiccups.
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}
