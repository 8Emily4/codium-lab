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
  blogNavVisible,
}: {
  session: SessionUser | null;
  lang: string;
  dict: Dictionary;
  /** When true, the 기술블로그 entry is added to the content menu. */
  blogNavVisible: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Primary links stay flat; content-type pages are grouped under a dropdown
  // so the bar stays tidy as more content surfaces are added.
  const primaryLinks: NavLink[] = [
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/services`, label: dict.nav.services },
    { href: `/${lang}/ai`, label: dict.nav.ai },
  ];
  const contentItems: NavLink[] = [
    { href: `/${lang}/media`, label: dict.nav.media },
    { href: `/${lang}/game`, label: dict.nav.game },
    ...(blogNavVisible
      ? [{ href: `/${lang}/blog`, label: dict.nav.blog }]
      : []),
  ];
  const faqLink: NavLink = { href: `/${lang}/faq`, label: dict.nav.faq };

  function isActive(href: string) {
    if (href === `/${lang}`) return pathname === `/${lang}` || pathname === `/${lang}/`;
    return pathname === href || pathname?.startsWith(`${href}/`) || false;
  }

  const contentActive = contentItems.some((i) => isActive(i.href));

  return (
    <>
      <nav className="hidden items-center gap-0.5 min-[900px]:flex">
        {primaryLinks.map((l) => (
          <NavPill key={l.href} href={l.href} label={l.label} active={isActive(l.href)} />
        ))}

        <ContentMenu
          label={dict.nav.content}
          items={contentItems}
          active={contentActive}
          isActive={isActive}
        />

        <NavPill href={faqLink.href} label={faqLink.label} active={isActive(faqLink.href)} />

        <span aria-hidden className="mx-1.5 inline-block h-4 w-px bg-zinc-300/70 dark:bg-zinc-700/70" />

        <LanguageSwitcher currentLang={lang} />

        <span aria-hidden className="mx-1 inline-block h-4 w-px bg-zinc-300/70 dark:bg-zinc-700/70" />

        {session ? (
          <>
            <Link
              href={`/${lang}/work`}
              className="mr-1 inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 px-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              {lang === "en" ? "Workspace" : "워크스페이스"}
            </Link>
            <SessionMenu user={session} lang={lang} />
          </>
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
            {primaryLinks.map((l) => (
              <MobileLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} onNavigate={() => setOpen(false)} />
            ))}

            <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">
              {dict.nav.content}
            </p>
            {contentItems.map((l) => (
              <MobileLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} onNavigate={() => setOpen(false)} indent />
            ))}

            <MobileLink href={faqLink.href} label={faqLink.label} active={isActive(faqLink.href)} onNavigate={() => setOpen(false)} />

            <LanguageSwitcher currentLang={lang} mobile onSwitch={() => setOpen(false)} />

            {session ? (
              <>
                <Link
                  href={`/${lang}/work`}
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 px-4 text-sm font-semibold text-white"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                  {lang === "en" ? "Open Workspace" : "워크스페이스 열기"}
                </Link>
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
              </>
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

function NavPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm transition ${
        active
          ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
      }`}
    >
      {label}
    </Link>
  );
}

function ContentMenu({
  label,
  items,
  active,
  isActive,
}: {
  label: string;
  items: NavLink[];
  active: boolean;
  isActive: (href: string) => boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm transition ${
          active || open
            ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
        }`}
      >
        {label}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`transition ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        // Outer wrapper sits flush under the button (top-full) and uses a
        // transparent pt-2 as a hover bridge, so moving the cursor down into
        // the menu never crosses an empty gap that would close it.
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
          <div
            role="menu"
            className="min-w-44 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)] dark:border-zinc-800 dark:bg-zinc-950"
          >
            {items.map((item) => {
              const a = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  aria-current={a ? "page" : undefined}
                  className={`block rounded-xl px-3.5 py-2 text-sm transition ${
                    a
                      ? "bg-zinc-900 font-medium text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileLink({
  href,
  label,
  active,
  onNavigate,
  indent = false,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate: () => void;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg py-3 text-sm transition ${indent ? "pl-7 pr-4" : "px-4"} ${
        active
          ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
      }`}
    >
      {label}
    </Link>
  );
}
