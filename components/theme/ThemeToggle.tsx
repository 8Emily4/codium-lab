"use client";

import { cn } from "@/lib/cn";
import { useTheme, type Theme } from "./ThemeProvider";

/** 클릭마다 시스템 → 라이트 → 다크 → 시스템 순으로 순환. */
const ORDER: Theme[] = ["system", "light", "dark"];

const COPY = {
  ko: { system: "시스템 설정", light: "라이트 모드", dark: "다크 모드", aria: "테마 전환" },
  en: { system: "System", light: "Light", dark: "Dark", aria: "Toggle theme" },
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
    // sun
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    );
  }
  if (theme === "dark") {
    // moon
    return (
      <svg {...common}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  // monitor (system)
  return (
    <svg {...common}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
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
  /** true 면 모바일 메뉴용으로 라벨 텍스트를 함께 표시. */
  withLabel?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const t = COPY[lang === "en" ? "en" : "ko"];
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        aria-label={`${t.aria}: ${t[theme]}`}
        className={cn(
          "flex items-center justify-between rounded-lg px-4 py-3 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900",
          className,
        )}
      >
        <span className="font-medium">{t.aria}</span>
        <span className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
          <Icon theme={theme} />
          {t[theme]}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`${t.aria}: ${t[theme]}`}
      title={t[theme]}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
        className,
      )}
    >
      <Icon theme={theme} />
    </button>
  );
}
