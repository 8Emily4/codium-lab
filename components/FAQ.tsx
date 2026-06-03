"use client";

import Reveal from "./Reveal";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export default function FAQ({ dict }: { dict: Dictionary }) {
  const { faqSection } = dict;

  return (
    <section
      id="faq"
      className="relative overflow-hidden border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950"
    >
      <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                {faqSection.eyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                <span className="text-gradient">{faqSection.titleHighlight}</span> {faqSection.title}
              </h2>
              <p className="mt-4 text-zinc-600 dark:text-zinc-300">
                {faqSection.desc}
              </p>
              <a
                href="#contact"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
              >
                {faqSection.ctaLabel}
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
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} direction="up">
            <div className="divide-y divide-zinc-200/80 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:divide-zinc-800/80 dark:border-zinc-800/80 dark:bg-zinc-900">
              {faqSection.items.map((item) => (
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
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
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
