"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/auth";
import SessionMenu from "./auth/SessionMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type NavLink = { href: string; label: string };

export default function NavLinks({
  session,
  lang,
  dict,
}: {
  session: SessionUser | null;
  lang: string;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links: NavLink[] = [
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/game`, label: dict.nav.game },
    { href: `/${lang}/services`, label: dict.nav.services },
    { href: `/${lang}/faq`, label: dict.nav.faq },
  ];

  function isActive(href: string) {
    if (href === `/${lang}`) return pathname === `/${lang}` || pathname === `/${lang}/`;
    return pathname === href || pathname?.startsWith(`${href}/`) || false;
  }

  return (
    <>
      <nav className="hidden items-center gap-0.5 min-[900px]:flex">
        {links.map((l) => {
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm transition ${
                active
                  ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              {l.label}
            </Link>
          );
        })}

        <span aria-hidden className="mx-1.5 inline-block h-4 w-px bg-zinc-300/70 dark:bg-zinc-700/70" />

        <LanguageSwitcher currentLang={lang} />

        <span aria-hidden className="mx-1 inline-block h-4 w-px bg-zinc-300/70 dark:bg-zinc-700/70" />

        {session ? (
          <SessionMenu user={session} />
        ) : (
          <Link
            href={`/${lang}/login`}
            className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-zinc-300/80 px-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700/80 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
          >
            {dict.nav.login}
          </Link>
        )}
        <Link
          href={`/${lang}/contact`}
          className="ml-1 inline-flex h-8 items-center whitespace-nowrap rounded-full bg-zinc-900 px-3 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {dict.nav.inquiry}
        </Link>
      </nav>

      <button
        type="button"
        aria-label={dict.nav.menuOpen}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 min-[900px]:hidden dark:border-zinc-800 dark:text-zinc-200"
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
        <div className="absolute inset-x-0 top-16 border-t border-zinc-200/60 bg-white min-[900px]:hidden dark:border-zinc-800/60 dark:bg-black">
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

            <LanguageSwitcher currentLang={lang} mobile onSwitch={() => setOpen(false)} />

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
                    {dict.nav.logout}
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href={`/${lang}/login`}
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-zinc-300/80 px-4 text-sm font-medium text-zinc-800 dark:border-zinc-700/80 dark:text-zinc-200"
              >
                {dict.nav.login}
              </Link>
            )}
            <Link
              href={`/${lang}/contact`}
              onClick={() => setOpen(false)}
              className="mt-2 mb-2 inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              {dict.nav.inquiry}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
