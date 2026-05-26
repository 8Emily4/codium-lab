import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { company, processPage } from "@/lib/brand";

export const metadata: Metadata = {
  title: "프로세스",
  description: "코디움랩의 네 단계 협업 — 발견 → 설계 → 구현 → 이관.",
  alternates: { canonical: "/process" },
  openGraph: {
    title: `프로세스 · ${company.nameKo}`,
    description: "코디움랩의 네 단계 협업 — 발견 → 설계 → 구현 → 이관.",
    url: "/process",
  },
};

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow={processPage.eyebrow}
        title={processPage.title}
        highlight={processPage.highlight}
        description={processPage.description}
        cta={
          <>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              협업 시작하기
            </Link>
            <Link
              href="/services"
              className="inline-flex h-12 items-center rounded-full border border-zinc-300/80 bg-white/70 px-6 text-sm font-medium text-zinc-900 backdrop-blur transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              서비스 보기
            </Link>
          </>
        }
      />

      <section className="relative border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              Stages
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              <span className="text-gradient">네 단계</span> 각각의 깊이
            </h2>
          </Reveal>

          <div className="mt-14 space-y-6">
            {processPage.steps.map((s, i) => (
              <Reveal
                key={s.step}
                delay={i * 140}
                direction={i % 2 === 0 ? "left" : "right"}
                className="card-elevate group relative flex flex-col rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-indigo-300 hover:shadow-[0_24px_60px_-30px_rgba(79,70,229,0.4)] sm:p-10 dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
              >
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                  <div>
                    <p className="text-gradient text-5xl font-bold tracking-tight">
                      {s.step}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {s.summary}
                    </p>
                    <p className="mt-5 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                      {s.body}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-6 border-t border-zinc-200/80 pt-6 sm:grid-cols-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-zinc-800/80">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
                        참여자
                      </p>
                      <ul className="mt-2 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                        {s.participants.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
                        산출물
                      </p>
                      <ul className="mt-2 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                        {s.deliverables.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
                        기간
                      </p>
                      <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {s.duration}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black">
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              Working agreements
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              <span className="text-gradient">협업 약속</span>
            </h2>
            <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-300">
              협업이 매끄럽도록 시작 전에 함께 약속하는 운영 원칙입니다.
            </p>
          </Reveal>
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processPage.agreements.map((a, i) => (
              <Reveal
                key={a.title}
                as="li"
                delay={i * 110}
                className="card-elevate rounded-2xl border border-zinc-200/80 bg-white p-6 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.35)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
              >
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {a.body}
                </p>
              </Reveal>
            ))}
          </ul>

          <div className="mt-14 text-center">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-7 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              협업 가능성 함께 검토하기
              <svg
                width="16"
                height="16"
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
          </div>
        </div>
      </section>
    </>
  );
}
