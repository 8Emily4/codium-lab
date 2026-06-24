"use client";

import { useCallback, useEffect, useState } from "react";
import Markdown from "./Markdown";

/**
 * 강의자료 풀스크린 발표 모드.
 * - [발표] 버튼을 렌더링하고, 클릭하면 화면 전체를 덮는 오버레이를 띄움(+ 네이티브 풀스크린 시도).
 * - 단축키: +/- 글자 크기, 0 기본, ESC 닫기.
 * - 다크모드는 prefers-color-scheme 기반이라 시스템 테마를 그대로 따라감(본문 Markdown 과 일관).
 * - 본문은 기존 Markdown 컴포넌트를 그대로 재사용하고 CSS `zoom` 으로 비례 확대.
 */

const ZOOM_LEVELS = [1, 1.15, 1.3, 1.5, 1.75, 2] as const;
const DEFAULT_ZOOM_INDEX = 2; // 130%

const T = {
  ko: {
    present: "발표",
    tip: "풀스크린 발표 모드",
    mode: "발표 모드",
    hint: "(단축키: + / − 글자 크기 · 0 기본 · ESC 닫기)",
    smaller: "작게 (−)",
    bigger: "크게 (+)",
    close: "닫기",
    eyebrow: "강의자료",
    emptyDoc: "_(빈 문서)_",
  },
  en: {
    present: "Present",
    tip: "Fullscreen presentation mode",
    mode: "Presentation",
    hint: "(Keys: + / − font size · 0 reset · ESC close)",
    smaller: "Smaller (−)",
    bigger: "Bigger (+)",
    close: "Close",
    eyebrow: "Material",
    emptyDoc: "_(empty document)_",
  },
} as const;

export default function MaterialPresentation({
  lang,
  title,
  summary,
  tags,
  body,
}: {
  lang: string;
  title: string;
  summary?: string | null;
  tags?: string[];
  body: string;
}) {
  const t = T[lang === "en" ? "en" : "ko"];
  const [open, setOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);

  const close = useCallback(() => {
    setOpen(false);
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const openPresent = useCallback(() => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
    setOpen(true);
    // 사용자 클릭(제스처) 컨텍스트에서 네이티브 풀스크린 시도 — 실패해도 오버레이는 동작.
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "+" || e.key === "=")
        setZoomIndex((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1));
      else if (e.key === "-" || e.key === "_")
        setZoomIndex((i) => Math.max(0, i - 1));
      else if (e.key === "0") setZoomIndex(DEFAULT_ZOOM_INDEX);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const zoom = ZOOM_LEVELS[zoomIndex];

  return (
    <>
      <button
        type="button"
        onClick={openPresent}
        title={t.tip}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
        {t.present}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] overflow-y-auto bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
        >
          {/* 상단 툴바 (스크롤해도 고정) */}
          <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
            <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-3 text-zinc-600 dark:text-zinc-300">
              <span className="text-xs font-semibold tracking-wider uppercase opacity-70">
                {t.mode}
              </span>
              <span className="hidden text-xs opacity-60 md:inline">
                {t.hint}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
                    disabled={zoomIndex === 0}
                    className="px-2.5 py-1 text-sm font-bold hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
                    title={t.smaller}
                  >
                    −
                  </button>
                  <span className="px-2 text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setZoomIndex((i) =>
                        Math.min(ZOOM_LEVELS.length - 1, i + 1),
                      )
                    }
                    disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                    className="px-2.5 py-1 text-sm font-bold hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
                    title={t.bigger}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                  title={`${t.close} (ESC)`}
                >
                  {t.close} ✕
                </button>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="mx-auto max-w-5xl px-6 pb-24 md:px-10">
            <div className="pt-8 pb-2">
              <div className="mb-2 text-xs tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
                {t.eyebrow}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
                {title}
              </h1>
              {summary && (
                <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
                  {summary}
                </p>
              )}
              {tags && tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div
              className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800"
              style={{ zoom }}
            >
              <Markdown>{body || t.emptyDoc}</Markdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
