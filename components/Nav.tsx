"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { company } from "@/lib/brand";

const links = [
  { href: "/about", label: "ABOUT" },
  {
    href: "/services/adium",
    label: "SERVICES",
    matches: ["/services"],
    children: [
      { href: "/services/adium", label: "Adium · AI 교육" },
      { href: "/services/badium", label: "Badium · 디자인" },
    ],
  },
  { href: "/academy", label: "ACADEMY" },
  { href: "/archive", label: "ARCHIVE" },
  { href: "/contact", label: "CONTACT" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";

  function isActive(link: (typeof links)[number]) {
    if (link.matches?.some((p) => pathname.startsWith(p))) return true;
    if (link.href === "/") return pathname === "/";
    return pathname === link.href || pathname.startsWith(link.href + "/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-black/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
            CL
          </span>
          <span>{company.nameKo}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = isActive(l);
            return (
              <div key={l.href} className="group relative">
                <Link
                  href={l.href}
                  className={`rounded-full px-3 py-2 text-xs font-medium tracking-[0.18em] uppercase transition ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                  }`}
                >
                  {l.label}
                </Link>
                {l.children && (
                  <div className="invisible absolute left-1/2 z-10 mt-1 w-56 -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white p-2 opacity-0 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.35)] transition group-hover:visible group-hover:opacity-100 dark:border-zinc-800 dark:bg-zinc-950">
                    {l.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <Link
            href="/contact"
            className="ml-2 inline-flex h-9 items-center rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 text-sm font-medium text-white transition hover:opacity-90"
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
      </div>

      {open && (
        <div className="border-t border-zinc-200/60 bg-white md:hidden dark:border-zinc-800/60 dark:bg-black">
          <nav className="mx-auto flex max-w-6xl flex-col px-3 py-2">
            {links.map((l) => (
              <div key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium tracking-[0.18em] text-zinc-700 uppercase hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  {l.label}
                </Link>
                {l.children && (
                  <div className="mb-1 ml-4 flex flex-col">
                    {l.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 mb-2 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 text-sm font-medium text-white"
            >
              문의 보내기
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
