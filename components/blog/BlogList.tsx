"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type BlogCard = {
  slug: string;
  title: string;
  summary: string | null;
  thumb: string | null;
  tags: string[];
  featured: boolean;
  /** Pre-formatted, locale-aware date string. */
  date: string;
};

export type BlogStrings = {
  filterAll: string;
  featuredLabel: string;
  readMore: string;
  empty: string;
};

export default function BlogList({
  items,
  strings,
  lang,
}: {
  items: BlogCard[];
  strings: BlogStrings;
  lang: string;
}) {
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [items]);

  const visible = useMemo(
    () => (tag ? items.filter((i) => i.tags.includes(tag)) : items),
    [items, tag],
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/60 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {strings.empty}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
      {tags.length > 0 && (
        <div className="mb-10 flex flex-wrap items-center gap-2">
          <FilterTab
            active={tag === null}
            onClick={() => setTag(null)}
            label={strings.filterAll}
          />
          {tags.map((t) => (
            <FilterTab
              key={t}
              active={tag === t}
              onClick={() => setTag(t)}
              label={`#${t}`}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <Card key={item.slug} item={item} strings={strings} lang={lang} />
        ))}
      </div>
    </section>
  );
}

function FilterTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm"
          : "border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
      }`}
    >
      {label}
    </button>
  );
}

function Card({
  item,
  strings,
  lang,
}: {
  item: BlogCard;
  strings: BlogStrings;
  lang: string;
}) {
  return (
    <Link
      href={`/${lang}/blog/${item.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(79,70,229,0.45)] dark:bg-zinc-950 ${
        item.featured
          ? "border-indigo-300 ring-1 ring-indigo-200 dark:border-indigo-800/70 dark:ring-indigo-900/50"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {/* Thumbnail */}
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
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-transparent">
            <svg
              viewBox="0 0 24 24"
              className="h-9 w-9 text-indigo-400/70 dark:text-indigo-300/50"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M9 7h7M9 11h7" />
            </svg>
          </div>
        )}

        {item.featured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden>
              <path d="m12 2 3 6.5 7 .8-5.2 4.7 1.5 6.9L12 17.8 5.7 21l1.5-6.9L2 9.3l7-.8z" />
            </svg>
            {strings.featuredLabel}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {item.date}
        </p>

        <h3 className="mt-2 line-clamp-2 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {item.title}
        </h3>

        {item.summary && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {item.summary}
          </p>
        )}

        {item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition group-hover:gap-2 dark:text-indigo-400">
          {strings.readMore}
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
