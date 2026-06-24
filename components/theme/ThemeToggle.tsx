"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useTheme, type Theme } from "./ThemeProvider";

const OPTIONS: Theme[] = ["light", "dark", "system"];

const COPY = {
  ko: { light: "라이트", dark: "다크", system: "시스템", aria: "테마 전환", label: "테마" },
  en: { light: "Light", dark: "Dark", system: "System", aria: "Toggle theme", label: "Theme" },
} as const;

function Icon({ theme }: { theme: Theme }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (theme === "light") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    );
  }
  if (theme === "dark") {
    return (
      <svg {...common}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
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

export default function ThemeToggle({
  lang,
  className,
  withLabel = false,
}: {
  lang: string;
  className?: string;
  /** true 면 모바일 메뉴용으로 라벨 + 3칸 세그먼트로 표시. */
  withLabel?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const t = COPY[lang === "en" ? "en" : "ko"];

  // 모바일 메뉴: 드롭다운 대신 라벨 + 세그먼트 컨트롤(드로어 안에서 더 자연스러움).
  if (withLabel) {
    return (
      <div className={cn("flex items-center justify-between rounded-lg px-4 py-3", className)}>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{t.label}</span>
        <div className="inline-flex items-center gap-0.5 rounded-full border border-zinc-200 p-0.5 dark:border-zinc-700">
          {OPTIONS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setTheme(o)}
              aria-label={t[o]}
              aria-pressed={theme === o}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
                theme === o
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
              )}
            >
              <Icon theme={o} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <ThemeDropdown lang={lang} className={className} />;
}

function ThemeDropdown({ lang, className }: { lang: string; className?: string }) {
  const { theme, setTheme } = useTheme();
  const t = COPY[lang === "en" ? "en" : "ko"];
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
        className={cn(
          "inline-flex h-8 items-center gap-1 rounded-full px-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
          className,
        )}
      >
        <Icon theme={theme} />
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
          {OPTIONS.map((o) => {
            const active = theme === o;
            return (
              <button
                key={o}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(o);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
                )}
              >
                <Icon theme={o} />
                <span className="flex-1 text-left">{t[o]}</span>
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
