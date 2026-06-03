"use client";

import { usePathname, useRouter } from "next/navigation";

const labels: Record<string, string> = { ko: "KO", en: "EN" };

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(lang: string) {
    if (lang === currentLang) return;
    // Replace /ko/ or /en/ prefix
    const withoutLang = pathname.replace(/^\/(ko|en)(\/|$)/, "/");
    router.push(`/${lang}${withoutLang === "/" ? "" : withoutLang}`);
  }

  return (
    <div className="flex items-center rounded-full border border-zinc-200/80 bg-white/50 p-0.5 text-[11px] font-semibold dark:border-zinc-700/80 dark:bg-zinc-900/50">
      {(["ko", "en"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => switchTo(lang)}
          aria-pressed={lang === currentLang}
          className={`rounded-full px-2.5 py-1 transition ${
            lang === currentLang
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          }`}
        >
          {labels[lang]}
        </button>
      ))}
    </div>
  );
}
