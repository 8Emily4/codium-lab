"use client";

import { useEffect, useState } from "react";

export type MediaCard = {
  id: string;
  type: "youtube" | "instagram" | "other";
  title: string;
  description: string | null;
  url: string;
  thumb: string | null;
  /** Set for YouTube items so we can embed an inline player. */
  embedUrl: string | null;
  tags: string[];
  featured: boolean;
};

export type ChannelGroup = {
  id: number;
  title: string;
  url: string;
  avatar: string | null;
  videos: MediaCard[];
};

export type MediaStrings = {
  typeYoutube: string;
  typeInstagram: string;
  typeOther: string;
  featuredLabel: string;
  watchLabel: string;
  openLabel: string;
  viewChannel: string;
  more: string;
  empty: string;
};

const TYPE_META: Record<
  MediaCard["type"],
  { badge: string; gradient: string; icon: React.ReactNode }
> = {
  youtube: {
    badge:
      "bg-red-50 text-red-600 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/60",
    gradient: "from-red-500/20 via-rose-500/10 to-transparent",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.5 15.5v-7l6.3 3.5-6.3 3.5z" />
      </svg>
    ),
  },
  instagram: {
    badge:
      "bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:ring-fuchsia-900/60",
    gradient: "from-fuchsia-500/20 via-purple-500/10 to-amber-400/10",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.26 2.2.43.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.4.37 1 .43 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.26 1.8-.43 2.2-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.4.17-1 .37-2.2.43-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.26-2.2-.43a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.4-.37-1-.43-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.26-1.8.43-2.2.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.4-.17 1-.37 2.2-.43C8.4 2.2 8.8 2.2 12 2.2zm0 3.05A6.75 6.75 0 1 0 18.75 12 6.75 6.75 0 0 0 12 5.25zm0 11.13A4.38 4.38 0 1 1 16.38 12 4.38 4.38 0 0 1 12 16.38zm6.9-11.4a1.58 1.58 0 1 1-1.58-1.57 1.58 1.58 0 0 1 1.58 1.57z" />
      </svg>
    ),
  },
  other: {
    badge:
      "bg-indigo-50 text-indigo-600 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60",
    gradient: "from-indigo-500/20 via-sky-500/10 to-transparent",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
};

export default function MediaGallery({
  channels,
  items,
  strings,
}: {
  channels: ChannelGroup[];
  items: MediaCard[];
  strings: MediaStrings;
}) {
  const [active, setActive] = useState<MediaCard | null>(null);

  const typeLabel: Record<MediaCard["type"], string> = {
    youtube: strings.typeYoutube,
    instagram: strings.typeInstagram,
    other: strings.typeOther,
  };

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

  function openCard(item: MediaCard) {
    if (item.type === "youtube" && item.embedUrl) {
      setActive(item);
    } else {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  }

  const isEmpty = channels.length === 0 && items.length === 0;
  if (isEmpty) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/60 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{strings.empty}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-6 py-14 sm:py-20">
      {channels.map((ch) => (
        <ChannelSection
          key={ch.id}
          channel={ch}
          typeLabel={typeLabel}
          strings={strings}
          onOpen={openCard}
        />
      ))}

      {items.length > 0 && (
        <section>
          <SectionHeading title={strings.more} />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card
                key={item.id}
                item={item}
                typeLabel={typeLabel[item.type]}
                strings={strings}
                onOpen={() => openCard(item)}
              />
            ))}
          </div>
        </section>
      )}

      {active && active.embedUrl && (
        <Lightbox item={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <span className="h-px flex-1 bg-gradient-to-r from-zinc-200 to-transparent dark:from-zinc-800" />
    </div>
  );
}

function ChannelSection({
  channel,
  typeLabel,
  strings,
  onOpen,
}: {
  channel: ChannelGroup;
  typeLabel: Record<MediaCard["type"], string>;
  strings: MediaStrings;
  onOpen: (item: MediaCard) => void;
}) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {channel.avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={channel.avatar}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
            />
          ) : (
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-base font-bold text-white">
              {(channel.title?.[0] ?? "Y").toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {channel.title}
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.5 15.5v-7l6.3 3.5-6.3 3.5z" />
              </svg>
              YouTube
            </span>
          </div>
        </div>
        <a
          href={channel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
        >
          {strings.viewChannel}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 17 17 7M7 7h10v10" />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {channel.videos.map((item) => (
          <Card
            key={item.id}
            item={item}
            typeLabel={typeLabel[item.type]}
            strings={strings}
            onOpen={() => onOpen(item)}
            hideTypeBadge
          />
        ))}
      </div>
    </section>
  );
}

function Card({
  item,
  typeLabel,
  strings,
  onOpen,
  hideTypeBadge,
}: {
  item: MediaCard;
  typeLabel: string;
  strings: MediaStrings;
  onOpen: () => void;
  hideTypeBadge?: boolean;
}) {
  const meta = TYPE_META[item.type];
  const isVideo = item.type === "youtube" && !!item.embedUrl;
  const actionLabel = isVideo ? strings.watchLabel : strings.openLabel;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(79,70,229,0.45)] dark:bg-zinc-950 ${
        item.featured
          ? "border-indigo-300 ring-1 ring-indigo-200 dark:border-indigo-800/70 dark:ring-indigo-900/50"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {item.thumb ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.thumb}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${meta.gradient}`}>
            <span className="text-zinc-400 dark:text-zinc-500">{meta.icon}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition group-hover:opacity-100" />

        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 scale-90 items-center justify-center rounded-full bg-white/95 text-zinc-900 opacity-0 shadow-lg backdrop-blur transition duration-300 group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-900/90 dark:text-white">
            {isVideo ? (
              <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-current" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            )}
          </span>
        </span>

        {item.featured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden>
              <path d="m12 2 3 6.5 7 .8-5.2 4.7 1.5 6.9L12 17.8 5.7 21l1.5-6.9L2 9.3l7-.8z" />
            </svg>
            {strings.featuredLabel}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {!hideTypeBadge && (
          <span className={`mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${meta.badge}`}>
            {meta.icon}
            {typeLabel}
          </span>
        )}

        <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {item.description}
          </p>
        )}

        {item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition group-hover:gap-2 dark:text-indigo-400">
          {actionLabel}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </button>
  );
}

function Lightbox({ item, onClose }: { item: MediaCard; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl">
        <div className="overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10">
          <div className="relative aspect-video w-full">
            <iframe
              src={`${item.embedUrl}&autoplay=1`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-white/90">{item.title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
