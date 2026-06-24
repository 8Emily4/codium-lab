import { NextResponse } from "next/server";
import {
  readAndClearStateCookie,
  setSession,
  type SessionUser,
} from "@/lib/auth";
import { resolveRole, upsertUserOnLogin } from "@/lib/users";

type KakaoTokenResponse = {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
};

type KakaoUserResponse = {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
  };
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
};

/**
 * The public origin to redirect back to. We trust the proxy's forwarded host
 * (the domain the user is actually on) over NEXT_PUBLIC_SITE_URL, so a stale or
 * missing env value can never bounce the user to localhost in production.
 */
function siteOrigin(req: Request): string {
  const h = req.headers;
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  if (host && !host.startsWith("localhost") && !host.startsWith("127.")) {
    return `${proto}://${host}`;
  }
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  return new URL(req.url).origin;
}

export async function GET(req: Request) {
  const origin = siteOrigin(req);
  const fail = (reason: string) => {
    const u = new URL("/login", origin);
    u.searchParams.set("error", reason);
    return NextResponse.redirect(u);
  };

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const compositeState = url.searchParams.get("state");
    const kakaoError = url.searchParams.get("error");

    if (kakaoError) {
      console.error("[kakao/callback] kakao returned error:", kakaoError);
      return fail(kakaoError);
    }
    if (!code || !compositeState) return fail("missing_code_or_state");

    const [state, encodedReturnTo] = compositeState.split(".");
    const savedState = await readAndClearStateCookie();
    if (!state || !savedState || state !== savedState) {
      return fail("invalid_state");
    }

    const clientId = process.env.KAKAO_CLIENT_ID;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;
    const redirectUri = process.env.KAKAO_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      console.error(
        "[kakao/callback] missing env:",
        !clientId ? "KAKAO_CLIENT_ID" : "",
        !redirectUri ? "KAKAO_REDIRECT_URI" : "",
      );
      return fail("env_missing");
    }

    // Exchange code → access token
    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
        ...(clientSecret ? { client_secret: clientSecret } : {}),
      }),
      cache: "no-store",
    });
    if (!tokenRes.ok) {
      // Surface the real Kakao reason (e.g. KOE006 redirect mismatch,
      // KOE010 bad client secret) in the server logs for diagnosis.
      const detail = await tokenRes.text().catch(() => "");
      console.error(
        "[kakao/callback] token exchange failed:",
        tokenRes.status,
        detail,
      );
      return fail("token_exchange_failed");
    }
    const token = (await tokenRes.json()) as KakaoTokenResponse;

    // Fetch profile
    const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
    });
    if (!userRes.ok) {
      const detail = await userRes.text().catch(() => "");
      console.error(
        "[kakao/callback] profile fetch failed:",
        userRes.status,
        detail,
      );
      return fail("profile_fetch_failed");
    }
    const profile = (await userRes.json()) as KakaoUserResponse;

    const nickname =
      profile.kakao_account?.profile?.nickname ??
      profile.properties?.nickname ??
      "Kakao 사용자";
    const avatar =
      profile.kakao_account?.profile?.thumbnail_image_url ??
      profile.properties?.thumbnail_image ??
      undefined;
    const email = profile.kakao_account?.email;

    const user: SessionUser = {
      id: `kakao:${profile.id}`,
      provider: "kakao",
      name: nickname,
      email,
      avatar,
      issuedAt: Date.now(),
    };

    // Record the login (with the host they came in through, so local-dev vs
    // production logins of the same person can be told apart), then stamp the
    // resolved role into the session.
    let loginHost: string | null = null;
    try {
      loginHost = new URL(origin).host;
    } catch {
      loginHost = null;
    }
    await upsertUserOnLogin(user, loginHost);
    user.role = await resolveRole(user.id);
    await setSession(user);

    // Redirect to the post-login splash, which animates and then forwards to returnTo
    const returnTo = encodedReturnTo ? decodeURIComponent(encodedReturnTo) : "/";
    const next = new URL("/login/loading", origin);
    next.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(next);
  } catch (err) {
    // Never leak a raw 500 to the user — log it and bounce back to /login.
    // The usual culprit here is a missing/short JWT_SECRET_KEY (AUTH_SECRET)
    // or the Turso DB being unreachable in production.
    console.error("[kakao/callback] unhandled error:", err);
    return fail("server_error");
  }
}
