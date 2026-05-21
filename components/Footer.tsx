import Link from "next/link";
import { company } from "@/lib/brand";

const navGroups = [
  {
    label: "Explore",
    links: [
      { href: "/brands", label: "브랜드" },
      { href: "/services", label: "서비스" },
      { href: "/process", label: "프로세스" },
      { href: "/ai", label: "AI" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "문의" },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
                CL
              </span>
              <span>{company.nameKo}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {company.tagline}
            </p>
          </div>

          {navGroups.map((g) => (
            <div key={g.label}>
              <p className="text-xs font-semibold tracking-[0.22em] text-zinc-500 uppercase dark:text-zinc-400">
                {g.label}
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-50"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-zinc-500 uppercase dark:text-zinc-400">
              Contact
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${company.contactEmail}`}
                  className="text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-50"
                >
                  {company.contactEmail}
                </a>
              </li>
              <li className="text-zinc-600 dark:text-zinc-400">{company.location}</li>
              <li className="text-zinc-600 dark:text-zinc-400">대표 · {company.ceo}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-zinc-200/70 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800/70 dark:text-zinc-400">
          <p>
            © {new Date().getFullYear()} {company.nameKo} ({company.nameEn}). All rights reserved.
          </p>
          <p>since {company.foundedYear}</p>
        </div>
      </div>
    </footer>
  );
}
