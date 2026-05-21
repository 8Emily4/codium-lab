import { NextResponse } from "next/server";
import { generateState, setStateCookie } from "@/lib/auth";

export async function GET(req: Request) {
  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Kakao OAuth env not configured (KAKAO_CLIENT_ID / KAKAO_REDIRECT_URI)." },
      { status: 500 },
    );
  }

  const state = generateState();
  await setStateCookie(state);

  const url = new URL(req.url);
  const returnTo = url.searchParams.get("returnTo") ?? "/";
  // Pack returnTo into state value so callback can restore it
  const compositeState = `${state}.${encodeURIComponent(returnTo)}`;

  const authorize = new URL("https://kauth.kakao.com/oauth/authorize");
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("state", compositeState);

  // Only request scopes that the Kakao app actually has configured.
  // If KAKAO_SCOPES is omitted, Kakao uses whatever required-consent items
  // are registered in the developer console — safest default.
  const scopes = process.env.KAKAO_SCOPES?.trim();
  if (scopes) authorize.searchParams.set("scope", scopes);

  return NextResponse.redirect(authorize.toString());
}
