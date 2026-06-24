import Link from "next/link";
import { company } from "@/lib/brand";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="absolute top-0 right-0 left-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
              CL
            </span>
            <span>{lang === "en" ? company.nameEn : company.nameKo}</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle lang={lang} className="bg-white/70 backdrop-blur dark:bg-zinc-900/60" />
            <Link
              href={`/${lang}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-300/70 bg-white/70 px-3.5 text-xs font-medium text-zinc-700 backdrop-blur transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {dict.auth.backToMain}
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
