"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Role, SessionUser } from "@/lib/auth";

const PROVIDER_LABEL: Record<SessionUser["provider"], string> = {
  kakao: "Kakao",
  naver: "Naver",
  google: "Google",
  meta: "Meta",
  local: "관리자",
};

const ROLE_LABEL: Record<Role, { ko: string; en: string; cls: string }> = {
  superAdmin: {
    ko: "슈퍼관리자",
    en: "Super Admin",
    cls: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:ring-fuchsia-900",
  },
  admin: {
    ko: "관리자",
    en: "Admin",
    cls: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-900",
  },
  user: {
    ko: "멤버",
    en: "Member",
    cls: "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700",
  },
};

export default function SessionMenu({
  user,
  lang = "ko",
}: {
  user: SessionUser;
  lang?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = user.name?.[0]?.toUpperCase() ?? "U";
  const role: Role = user.role ?? "user";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-zinc-300/80 bg-white/70 px-2.5 pr-3 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
      >
        {user.avatar ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={user.avatar}
            alt=""
            className="h-6 w-6 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-700"
          />
        ) : (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[10px] font-bold text-white">
            {initial}
          </span>
        )}
        <span className="hidden max-w-[7rem] truncate sm:inline">{user.name}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`opacity-60 transition ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.25)] backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950"
        >
          <div className="rounded-xl bg-zinc-50 px-3 py-3 dark:bg-zinc-900">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {user.name}
            </p>
            {user.email && (
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {user.email}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold tracking-[0.16em] text-indigo-600 uppercase ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-indigo-300 dark:ring-zinc-800">
                {PROVIDER_LABEL[user.provider]} 로그인
              </span>
              {role !== "user" && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${ROLE_LABEL[role].cls}`}
                >
                  {lang === "en" ? ROLE_LABEL[role].en : ROLE_LABEL[role].ko}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/${lang}/work`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex w-full items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            {lang === "en" ? "Open Workspace" : "워크스페이스 열기"}
          </Link>

          <form action="/api/auth/logout" method="POST" className="mt-1">
            <button
              type="submit"
              className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              로그아웃
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
