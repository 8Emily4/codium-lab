"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

const LANGS = ["ko", "en"] as const;
type Lang = (typeof LANGS)[number];

const COPY = {
  ko: { ko: "한국어", en: "English", aria: "언어 선택", label: "언어" },
  en: { ko: "한국어", en: "English", aria: "Select language", label: "Language" },
} as const;

function Globe() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

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
  const t = COPY[currentLang === "en" ? "en" : "ko"];

  function switchTo(lang: Lang) {
    if (lang === currentLang) {
      onSwitch?.();
      return;
    }
    const withoutLang = pathname.replace(/^\/(ko|en)(\/|$)/, "/");
    router.push(`/${lang}${withoutLang === "/" ? "" : withoutLang}`);
    onSwitch?.();
  }

  // 모바일 메뉴: 테마 토글과 같은 라벨 + 세그먼트 컨트롤.
  if (mobile) {
    return (
      <div className="flex items-center justify-between rounded-lg px-4 py-3">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{t.label}</span>
        <div className="inline-flex items-center gap-0.5 rounded-full border border-zinc-200 p-0.5 dark:border-zinc-700">
          {LANGS.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => switchTo(lang)}
              aria-pressed={lang === currentLang}
              className={cn(
                "inline-flex h-8 items-center justify-center rounded-full px-3 text-sm transition",
                lang === currentLang
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
              )}
            >
              {t[lang]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <LanguageDropdown currentLang={currentLang} switchTo={switchTo} t={t} />;
}

function LanguageDropdown({
  currentLang,
  switchTo,
  t,
}: {
  currentLang: string;
  switchTo: (lang: Lang) => void;
  t: (typeof COPY)[keyof typeof COPY];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 바깥 클릭 / ESC 로 닫기.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.aria}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
      >
        <Globe />
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={cn("transition", open && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-36 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)] dark:border-zinc-800 dark:bg-zinc-950"
        >
          {LANGS.map((lang) => {
            const active = lang === currentLang;
            return (
              <button
                key={lang}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  switchTo(lang);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
                )}
              >
                <span className="flex-1 text-left">{t[lang]}</span>
                <span className={cn("text-indigo-500", !active && "invisible")}>
                  <Check />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
