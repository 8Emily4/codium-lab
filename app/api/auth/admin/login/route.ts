import { NextResponse } from "next/server";
import { setSession, type SessionUser } from "@/lib/auth";
import {
  getCredentialAdminEmail,
  getCredentialAdminId,
  verifyAdminCredentials,
} from "@/lib/users";

/** Only allow same-origin relative paths as a post-login destination. */
function safeReturnTo(value: string, lang: string): string {
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return `/${lang}/work`;
}

export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const lang = String(form.get("lang") ?? "ko");
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? ""), lang);

  const failRedirect = NextResponse.redirect(
    new URL(
      `/${lang}/login/admin?error=invalid&returnTo=${encodeURIComponent(returnTo)}`,
      origin,
    ),
    { status: 303 },
  );

  if (!verifyAdminCredentials(email, password)) return failRedirect;

  const id = getCredentialAdminId();
  if (!id) return failRedirect;

  const user: SessionUser = {
    id,
    provider: "local",
    name: process.env.SUPER_ADMIN_NAME?.trim() || "운영자",
    email: getCredentialAdminEmail() ?? undefined,
    role: "superAdmin",
    issuedAt: Date.now(),
  };
  await setSession(user);

  return NextResponse.redirect(new URL(returnTo, origin), { status: 303 });
}
