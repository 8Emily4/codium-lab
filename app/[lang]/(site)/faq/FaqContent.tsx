"use client";

import { useMemo, useState } from "react";
import Reveal from "@/components/Reveal";
import type { Dictionary } from "../../dictionaries";

type FaqDict = Dictionary["faq"];

export default function FaqContent({ faq }: { faq: FaqDict }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const flat = useMemo(
    () => faq.categories.flatMap((c) => c.items),
    [faq],
  );

  const active = faq.categories[activeIdx];

  return (
    <section className="relative border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
      <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-16">
          <Reveal>
            <aside className="lg:sticky lg:top-24">
              <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase dark:text-zinc-400">
                {faq.categoriesLabel}
              </p>
              <ul className="mt-4 space-y-1">
                {faq.categories.map((c, i) => {
                  const isActive = i === activeIdx;
                  return (
                    <li key={c.label}>
                      <button
                        type="button"
                        onClick={() => setActiveIdx(i)}
                        aria-current={isActive ? "true" : undefined}
                        className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                          isActive
                            ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm"
                            : "text-zinc-700 hover:bg-white hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                        }`}
                      >
                        <span className="font-medium">{c.label}</span>
                        <span className={`text-xs ${isActive ? "text-white/80" : "text-zinc-400 dark:text-zinc-500"}`}>
                          {c.items.length}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-8 text-xs text-zinc-500 dark:text-zinc-400">
                {faq.totalLabel} {flat.length} {faq.totalSuffix}
              </p>
            </aside>
          </Reveal>

          <Reveal delay={120}>
            <div className="divide-y divide-zinc-200/80 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:divide-zinc-800/80 dark:border-zinc-800/80 dark:bg-zinc-900">
              {active.items.map((item) => (
                <details
                  key={item.q}
                  className="group [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-5 text-left transition hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50">
                    <span className="pt-0.5 text-base font-medium text-zinc-900 dark:text-zinc-50">
                      {item.q}
                    </span>
                    <span
                      aria-hidden
                      className="mt-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition group-open:rotate-45 group-open:border-transparent group-open:bg-gradient-to-br group-open:from-indigo-500 group-open:to-fuchsia-500 group-open:text-white dark:border-zinc-700 dark:text-zinc-400"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <div className="border-l-2 border-indigo-500/60 bg-gradient-to-r from-indigo-50/40 to-transparent px-6 pb-6 text-sm leading-7 text-zinc-600 dark:from-indigo-500/5 dark:text-zinc-300">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
