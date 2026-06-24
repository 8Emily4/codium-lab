"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fires a single fire-and-forget beacon to /api/analytics/track on each public
 * page view (including client-side navigations). No-op for /work, /login and
 * other internal areas. Failures are silent — analytics never blocks the user.
 */
export default function AnalyticsTracker({ lang }: { lang: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (
      pathname.includes("/work") ||
      pathname.includes("/login") ||
      pathname.startsWith("/api")
    ) {
      return;
    }

    const utmSource = new URLSearchParams(window.location.search).get(
      "utm_source",
    );

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
      utmSource,
      lang,
    });

    // Prefer sendBeacon so the request survives navigation away from the page.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/track",
        new Blob([payload], { type: "application/json" }),
      );
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname, lang]);

  return null;
}
