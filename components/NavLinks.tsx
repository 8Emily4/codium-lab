"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/auth";
import SessionMenu from "./auth/SessionMenu";

type NavLink = { href: string; label: string };

const links: NavLink[] = [
  { href: "/brands", label: "브랜드" },
  { href: "/services", label: "서비스" },
  { href: "/process", label: "프로세스" },
  { href: "/ai", label: "AI" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "문의" },
];

export default function NavLinks({ session }: { session: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`) || false;
  }

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {links.map((l) => {
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-sm transition ${
                active
                  ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              {l.label}
            </Link>
          );
        })}

        <span aria-hidden className="mx-2 inline-block h-4 w-px bg-zinc-300/70 dark:bg-zinc-700/70" />

        {session ? (
          <SessionMenu user={session} />
        ) : (
          <Link
            href="/login"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-300/80 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700/80 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
          >
            로그인
          </Link>
        )}
        <Link
          href="/contact"
          className="ml-1 inline-flex h-9 items-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          문의 보내기
        </Link>
      </nav>

      <button
        type="button"
        aria-label="메뉴 열기"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 md:hidden dark:border-zinc-800 dark:text-zinc-200"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          {open ? (
            <>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </>
          ) : (
            <>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 border-t border-zinc-200/60 bg-white md:hidden dark:border-zinc-800/60 dark:bg-black">
          <nav className="mx-auto flex max-w-6xl flex-col px-3 py-2">
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-4 py-3 text-sm transition ${
                    active
                      ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            {session ? (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-zinc-100 px-4 py-3 text-sm dark:bg-zinc-900">
                <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
                  {session.name}
                </span>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="text-xs text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
                  >
                    로그아웃
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-zinc-300/80 px-4 text-sm font-medium text-zinc-800 dark:border-zinc-700/80 dark:text-zinc-200"
              >
                로그인
              </Link>
            )}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 mb-2 inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              문의 보내기
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
