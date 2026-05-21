"use client";

import { useRef, useState } from "react";
import type { SubBrand } from "@/lib/brand";

export default function BrandCard({ brand, index }: { brand: SubBrand; index: number }) {
  const ref = useRef<HTMLElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  function onMove(e: React.MouseEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos(null)}
      className="group card-elevate relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-zinc-300 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      {/* Spotlight follow cursor */}
      {pos && (
        <span
          aria-hidden
          className="pointer-events-none absolute -z-0 h-72 w-72 rounded-full opacity-60 blur-3xl transition-opacity duration-300"
          style={{
            left: pos.x - 144,
            top: pos.y - 144,
            background:
              brand.slug === "adium"
                ? "radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)"
                : "radial-gradient(circle, rgba(217,70,239,0.35), transparent 70%)",
          }}
        />
      )}

      <div className={`h-1.5 w-full bg-gradient-to-r ${brand.accent}`} aria-hidden />

      <div className="relative z-10 flex flex-1 flex-col p-8 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.24em] text-zinc-500 uppercase">
              0{index + 1} · {brand.nameEn}
            </p>
            <h3 className="mt-1.5 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              {brand.nameKo}
            </h3>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm bg-gradient-to-br ${brand.accent}`}
          >
            {brand.tagline}
          </span>
        </div>

        <p className="mt-6 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
          {brand.description}
        </p>

        <ul className="mt-7 space-y-2.5 text-sm text-zinc-600 dark:text-zinc-300">
          {brand.highlights.map((h, i) => (
            <li
              key={h}
              className="flex items-start gap-3 opacity-0 [animation:fadeUp_0.6s_cubic-bezier(0.2,0.8,0.2,1)_forwards]"
              style={{ animationDelay: `${300 + i * 100}ms` }}
            >
              <span
                aria-hidden
                className={`mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-br ${brand.accent} shadow-[0_0_0_3px_rgba(99,102,241,0.12)]`}
              />
              <span className="leading-relaxed">{h}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          {brand.href ? (
            <a
              href={brand.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/cta inline-flex items-center gap-2 text-sm font-medium text-zinc-900 transition dark:text-zinc-100"
            >
              <span className="underline-offset-4 group-hover/cta:underline">
                자세히 보기
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                aria-hidden
              >
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
              <span className="anim-pulse-soft inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
              사이트 준비 중
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </article>
  );
}
