"use client";

import { useState } from "react";
import Link from "next/link";
import { subBrands } from "@/lib/brand";

export default function BrandShowcase() {
  const [active, setActive] = useState<"adium" | "badium">("adium");
  const brand = subBrands.find((b) => b.slug === active)!;

  return (
    <section
      id="brands"
      className="relative overflow-hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-700`}
      >
        <div
          className={`absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br ${brand.accent} opacity-20 blur-[120px]`}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              Two Wheels
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              코디움랩의 두 바퀴 — 가르치는 브랜드와 디자인하는 브랜드
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
              교육과 디자인, 결이 다른 두 브랜드가 한 연구소 안에서 함께
              굴러갑니다. 원하는 결의 서비스로 바로 들어가세요.
            </p>
          </div>
          <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            {subBrands.map((b) => (
              <button
                key={b.slug}
                type="button"
                onClick={() => setActive(b.slug)}
                className={`rounded-full px-5 py-2 font-medium transition ${
                  active === b.slug
                    ? `bg-gradient-to-r ${b.accent} text-white shadow`
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                }`}
              >
                {b.nameEn}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <article className="lg:col-span-3 flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className={`h-1.5 w-full bg-gradient-to-r ${brand.accent}`} />
            <div className="flex flex-1 flex-col gap-6 p-8 sm:p-10">
              <div>
                <p className="text-xs font-medium tracking-[0.22em] text-zinc-500 uppercase">
                  {brand.nameEn} · {brand.tagline}
                </p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {brand.nameKo}
                </h3>
              </div>
              <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
                {brand.description}
              </p>
              <ul className="grid grid-cols-1 gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                {brand.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className={`mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-br ${brand.accent}`}
                    />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex flex-wrap gap-3">
                <Link
                  href={brand.href}
                  className={`inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r ${brand.accent} px-6 text-sm font-medium text-white transition hover:opacity-90`}
                >
                  {brand.nameKo} 사업부 살펴보기
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/academy"
                  className="inline-flex h-11 items-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-900 transition hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500"
                >
                  과정 신청
                </Link>
              </div>
            </div>
          </article>

          <aside className="lg:col-span-2 flex flex-col gap-4">
            {subBrands.map((b) => (
              <button
                key={b.slug}
                type="button"
                onClick={() => setActive(b.slug)}
                className={`group text-left rounded-3xl border p-6 transition ${
                  active === b.slug
                    ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
                    : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium tracking-[0.22em] text-zinc-500 uppercase">
                    {b.nameEn}
                  </p>
                  <span
                    aria-hidden
                    className={`inline-block h-2 w-2 rounded-full bg-gradient-to-br ${b.accent}`}
                  />
                </div>
                <h4 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {b.nameKo}
                </h4>
                <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  {b.tagline}
                </p>
              </button>
            ))}
            <div className="mt-2 rounded-3xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              두 브랜드 모두 <span className="font-semibold text-zinc-700 dark:text-zinc-200">코디움랩 통합 결제</span>로
              한 번에 결제·관리할 수 있어요.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
