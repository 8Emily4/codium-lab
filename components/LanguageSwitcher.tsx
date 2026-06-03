"use client";

import { usePathname, useRouter } from "next/navigation";

const shortLabels: Record<string, string> = { ko: "KO", en: "EN" };

export default function LanguageSwitcher({
  currentLang,
  mobile = false,
  onSwitch,
}: {
  currentLang: string;
  mobile?: boolean;
  onSwitch?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(lang: string) {
    if (lang === currentLang) return;
    const withoutLang = pathname.replace(/^\/(ko|en)(\/|$)/, "/");
    router.push(`/${lang}${withoutLang === "/" ? "" : withoutLang}`);
    onSwitch?.();
  }

  if (mobile) {
    return (
      <div className="mt-1 grid grid-cols-2 gap-2 px-1">
        {(["ko", "en"] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => switchTo(lang)}
            aria-pressed={lang === currentLang}
            className={`flex h-11 items-center justify-center rounded-full text-sm font-medium transition ${
              lang === currentLang
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            }`}
          >
            {shortLabels[lang]}
          </button>
        ))}
      </div>
    );
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
          {shortLabels[lang]}
        </button>
      ))}
    </div>
  );
}
