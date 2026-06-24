"use client";

import { useEffect, useState } from "react";

export type GalleryCard = {
  id: number;
  kind: "image" | "video";
  title: string;
  description: string | null;
  /** 이미지 src 또는 영상 썸네일 URL. */
  src: string | null;
  /** 영상 전용: 인라인 임베드 URL. */
  embedUrl: string | null;
  width: number | null;
  height: number | null;
  featured: boolean;
};

export type GalleryStrings = {
  imageLabel: string;
  videoLabel: string;
  featuredLabel: string;
  watchLabel: string;
  empty: string;
};

export default function GalleryView({
  items,
  strings,
}: {
  items: GalleryCard[];
  strings: GalleryStrings;
}) {
  // 라이트박스에서 좌우 이동하려면 단일 항목이 아니라 인덱스를 추적한다.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : items[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowLeft")
        setActiveIndex((i) => (i === null ? i : Math.max(0, i - 1)));
      if (e.key === "ArrowRight")
        setActiveIndex((i) =>
          i === null ? i : Math.min(items.length - 1, i + 1),
        );
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [activeIndex, items.length]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/60 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{strings.empty}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pb-24">
        {/* 크기가 일정한 카드 그리드. 각 카드는 고정 비율 썸네일을 가진다. */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <GalleryTile
              key={item.id}
              item={item}
              strings={strings}
              onOpen={() => setActiveIndex(i)}
            />
          ))}
        </div>
      </div>

      {active && activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActiveIndex(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {items.length > 1 && (
            <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
              {activeIndex + 1} / {items.length}
            </span>
          )}

          {activeIndex > 0 && (
            <button
              type="button"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((i) => (i === null ? i : Math.max(0, i - 1)));
              }}
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-5"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          {activeIndex < items.length - 1 && (
            <button
              type="button"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((i) =>
                  i === null ? i : Math.min(items.length - 1, i + 1),
                );
              }}
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-5"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-full w-full max-w-4xl overflow-hidden"
          >
            {active.kind === "video" && active.embedUrl ? (
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
                <iframe
                  src={active.embedUrl}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : active.src ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={active.src}
                alt={active.title}
                className="mx-auto max-h-[85vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />
            ) : null}
            {(active.title || active.description) && (
              <div className="mx-auto mt-3 max-w-2xl text-center">
                <p className="text-sm font-semibold text-white">{active.title}</p>
                {active.description && (
                  <p className="mt-1 text-xs text-white/70">{active.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function GalleryTile({
  item,
  strings,
  onOpen,
}: {
  item: GalleryCard;
  strings: GalleryStrings;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex w-full flex-col overflow-hidden rounded-2xl border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-zinc-900 ${
        item.featured
          ? "border-amber-300 ring-1 ring-amber-200 dark:border-amber-500/50 dark:ring-amber-500/30"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {/* 카드 크기를 일정하게 유지하기 위해 썸네일은 고정 비율(4:3)로 잘라 보여준다. */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {item.src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.src}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
            {item.title}
          </div>
        )}

        {item.kind === "video" && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-current" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        )}

        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 backdrop-blur ${
              item.kind === "video"
                ? "bg-red-500/90 text-white ring-red-300/40"
                : "bg-white/85 text-zinc-700 ring-white/60 dark:bg-zinc-900/80 dark:text-zinc-200 dark:ring-zinc-700"
            }`}
          >
            {item.kind === "video" ? strings.videoLabel : strings.imageLabel}
          </span>
          {item.featured && (
            <span className="inline-flex items-center rounded-full bg-amber-400/90 px-2 py-0.5 text-[11px] font-semibold text-amber-950 ring-1 ring-amber-300/50 backdrop-blur">
              {strings.featuredLabel}
            </span>
          )}
        </div>
      </div>

      {(item.title || item.description) && (
        <div className="p-4">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</p>
          {item.description && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{item.description}</p>
          )}
        </div>
      )}
    </button>
  );
}
