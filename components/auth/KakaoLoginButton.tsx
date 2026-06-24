"use client";

import { useState } from "react";

export default function KakaoLoginButton({ returnTo = "/", lang = "ko" }: { returnTo?: string; lang?: string }) {
  const [loading, setLoading] = useState(false);

  function onClick() {
    setLoading(true);
    const url = new URL("/api/auth/kakao", window.location.origin);
    if (returnTo) url.searchParams.set("returnTo", returnTo);
    window.location.href = url.toString();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#FEE500] text-sm font-medium text-[#3C1E1E] shadow-sm transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        aria-hidden
        className="text-[#3C1E1E]"
      >
        <path
          d="M9 1.5C4.5 1.5 1 4.4 1 8c0 2.3 1.5 4.4 3.7 5.5l-.8 3 3.4-2.2c.6.1 1.1.1 1.7.1 4.5 0 8-2.9 8-6.5S13.5 1.5 9 1.5z"
          fill="currentColor"
        />
      </svg>
      <span>
        {loading
          ? lang === "en"
            ? "Redirecting…"
            : "이동 중…"
          : lang === "en"
            ? "Start with Kakao in 3 seconds"
            : "카카오로 3초 만에 시작"}
      </span>
      {loading && (
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent animate-[shimmer_1.2s_ease_infinite]"
        />
      )}
    </button>
  );
}
