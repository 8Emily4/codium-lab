"use client";

import { useMemo, useState } from "react";
import { archivePosts, type ArchivePost } from "@/lib/brand";

type Category = "ALL" | ArchivePost["category"];

const categories: Category[] = ["ALL", "AI 트렌드", "디지털 팁", "포트폴리오"];

const categoryStyle: Record<ArchivePost["category"], string> = {
  "AI 트렌드":
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  "디지털 팁":
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  포트폴리오:
    "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
};

export default function ArchiveBrowser() {
  const [cat, setCat] = useState<Category>("ALL");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return archivePosts.filter((p) => {
      if (cat !== "ALL" && p.category !== cat) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q)
      );
    });
  }, [cat, query]);

  return (
    <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex flex-wrap gap-1 rounded-full border border-zinc-200 bg-white p-1 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`rounded-full px-4 py-2 font-medium transition ${
                  cat === c
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <label className="relative w-full sm:w-72">
            <span className="sr-only">검색</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목·요약 검색"
              className="block w-full rounded-full border border-zinc-300 bg-white py-2.5 pr-4 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <svg
              aria-hidden
              className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </label>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <article
              key={p.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
            >
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-indigo-200 via-fuchsia-200 to-rose-200 dark:from-indigo-500/30 dark:via-fuchsia-500/30 dark:to-rose-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.55),transparent_55%)]" />
                <span
                  className={`absolute bottom-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryStyle[p.category]}`}
                >
                  {p.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-50 dark:group-hover:text-indigo-300">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {p.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between pt-5 text-xs text-zinc-500 dark:text-zinc-400">
                  <time dateTime={p.date}>{p.date}</time>
                  <span>{p.readMinutes}분</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="mt-12 rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            조건에 맞는 글이 없습니다. 다른 카테고리 또는 키워드로 시도해보세요.
          </p>
        )}
      </div>
    </section>
  );
}
