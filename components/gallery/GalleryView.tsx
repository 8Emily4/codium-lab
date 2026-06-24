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
  const [active, setActive] = useState<GalleryCard | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

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
        {/* 세로 길이가 제각각인 이미지를 자연스럽게 배치하기 위한 CSS 컬럼(메이슨리). */}
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {items.map((item) => (
            <GalleryTile
              key={item.id}
              item={item}
              strings={strings}
              onOpen={() => setActive(item)}
            />
          ))}
        </div>
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

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
  const ratio =
    item.kind === "image" && item.width && item.height
      ? `${item.width} / ${item.height}`
      : item.kind === "video"
        ? "16 / 9"
        : undefined;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group block w-full break-inside-avoid overflow-hidden rounded-2xl border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-zinc-900 ${
        item.featured
          ? "border-amber-300 ring-1 ring-amber-200 dark:border-amber-500/50 dark:ring-amber-500/30"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div
        className="relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800"
        style={ratio ? { aspectRatio: ratio } : undefined}
      >
        {item.src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.src}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center text-xs text-zinc-400">
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
