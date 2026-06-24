import Link from "next/link";
import { company } from "@/lib/brand";
import { getTotalVisitors } from "@/lib/analytics";
import Logo from "./Logo";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const navLinks = [
  { key: "about" as const, href: "about" },
  { key: "game" as const, href: "game" },
  { key: "services" as const, href: "services" },
  { key: "ai" as const, href: "ai" },
  { key: "faq" as const, href: "faq" },
  { key: "contact" as const, href: "contact" },
];

export default async function Footer({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  const visitors = await getTotalVisitors();
  const visitorLine =
    visitors > 0
      ? lang === "en"
        ? `${visitors.toLocaleString("en-US")} visitors so far`
        : `지금까지 ${visitors.toLocaleString("ko-KR")}명이 방문했어요`
      : null;
  return (
    <footer className="relative overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-600/60 to-transparent" />

      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_10%_0%,rgba(99,102,241,0.08),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href={`/${lang}`}
              className="group inline-flex items-center gap-2.5"
            >
              <Logo className="h-8 w-8 shrink-0 transition-opacity group-hover:opacity-80" />
              <span className="text-sm font-semibold tracking-tight text-zinc-100 transition-colors group-hover:text-white">
                {lang === "en" ? company.nameEn : company.nameKo}
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-zinc-500">
              {dict.company.tagline}
            </p>
            <a
              href={company.sns[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>

          {/* Nav links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              {dict.footer.exploreLabel}
            </p>
            <ul className="space-y-2.5">
              {navLinks.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={`/${lang}/${href}`}
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                  >
                    {dict.footer.links[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              {dict.footer.contactLabel}
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={`mailto:${company.contactEmail}`}
                  className="text-zinc-300 transition-colors hover:text-white"
                >
                  {company.contactEmail}
                </a>
              </li>
              <li className="text-zinc-500">{dict.company.location}</li>
              <li className="text-zinc-500">
                {dict.footer.ceoLabel} {dict.company.ceo}
              </li>
            </ul>
          </div>
        </div>

        {/* Oversized brand watermark */}
        <div className="pointer-events-none mt-10 select-none overflow-hidden">
          <p className="text-[clamp(3rem,10vw,6rem)] font-black uppercase leading-none tracking-tighter text-zinc-900/60">
            {lang === "en" ? company.nameEn : company.nameKo}
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-4 flex flex-col gap-2 border-t border-zinc-800/50 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()}{" "}
            {lang === "en"
              ? company.nameEn
              : `${company.nameKo} (${company.nameEn})`}
            . All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {visitorLine && (
              <p className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5 text-zinc-600"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {visitorLine}
              </p>
            )}
            <p className="font-mono text-xs text-zinc-700">
              since {company.foundedYear}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
