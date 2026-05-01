"use client";

import { company } from "@/lib/brand";

export default function FAQ() {
  return (
    <section
      id="faq"
      className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
          FAQ
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          자주 묻는 질문
        </h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          여기 없는 질문은 아래 문의 폼으로 보내주세요. 평일 기준 1–2영업일 안에 회신드립니다.
        </p>

        <div className="mt-10 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {company.faq.map((item) => (
            <details
              key={item.q}
              className="group [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <span className="pt-0.5 text-base font-medium text-zinc-900 dark:text-zinc-50">
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition group-open:rotate-45 group-open:border-indigo-500 group-open:bg-indigo-500 group-open:text-white dark:border-zinc-700 dark:text-zinc-400"
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
              <div className="border-l-2 border-indigo-500 px-6 pb-6 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
