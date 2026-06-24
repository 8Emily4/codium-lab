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

function badRequest(reason: string, status = 400) {
  const url = new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const compositeState = url.searchParams.get("state");
  const kakaoError = url.searchParams.get("error");

  if (kakaoError) return badRequest(kakaoError);
  if (!code || !compositeState) return badRequest("missing_code_or_state");

  const [state, encodedReturnTo] = compositeState.split(".");
  const savedState = await readAndClearStateCookie();
  if (!state || !savedState || state !== savedState) {
    return badRequest("invalid_state");
  }

  const clientId = process.env.KAKAO_CLIENT_ID;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;
  if (!clientId || !redirectUri) return badRequest("env_missing", 500);

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
  if (!tokenRes.ok) return badRequest("token_exchange_failed", 502);
  const token = (await tokenRes.json()) as KakaoTokenResponse;

  // Fetch profile
  const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });
  if (!userRes.ok) return badRequest("profile_fetch_failed", 502);
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

  // Record the login, then stamp the resolved role into the session.
  await upsertUserOnLogin(user);
  user.role = await resolveRole(user.id);
  await setSession(user);

  // Redirect to the post-login splash, which animates and then forwards to returnTo
  const returnTo = encodedReturnTo ? decodeURIComponent(encodedReturnTo) : "/";
  const next = new URL("/login/loading", process.env.NEXT_PUBLIC_SITE_URL || url.origin);
  next.searchParams.set("returnTo", returnTo);
  return NextResponse.redirect(next);
}
