import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["ko", "en"];
const defaultLocale = "ko";

function getLocale(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language") ?? "";
  for (const part of acceptLang.split(",")) {
    const lang = part.split(";")[0].trim().toLowerCase();
    if (lang.startsWith("en")) return "en";
    if (lang.startsWith("ko")) return "ko";
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal Next.js paths and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    const locale = pathname.split("/")[1];
    const response = NextResponse.next();
    response.headers.set("x-lang", locale);
    return response;
  }

  // Redirect to localized path
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(request.nextUrl);
  response.headers.set("x-lang", locale);
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon|apple-touch|og-image|app-icon|sitemap|robots|naver).*)"],
};
