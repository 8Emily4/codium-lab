import type { Metadata } from "next";
import Link from "next/link";
import { aiPage, company } from "@/lib/brand";
import FloatingTokens from "@/components/FloatingTokens";
import CodeTyper from "@/components/CodeTyper";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: `AI · ${company.nameKo} | ${company.nameEn}`,
  description:
    "코디움랩의 AI 접근: AI로 개발하고, 업무에 녹이는 시스템을 만듭니다. Claude·Cursor·MCP·RAG 기반 사내 도입.",
};

export default function AiPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section
        id="ai-top"
        className="relative overflow-hidden border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black"
      >
        <div className="bg-mesh absolute inset-0" aria-hidden />
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="bg-noise" aria-hidden />
        <FloatingTokens density="light" mask="right-half" />
        <CodeTyper position="topRight" startIdx={0} />
        <CodeTyper position="bottomRight" startIdx={2} />
        <div
          className="anim-float pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/30 to-fuchsia-400/20 blur-3xl dark:from-indigo-500/20 dark:to-fuchsia-500/10"
          aria-hidden
        />
        <div
          className="anim-float pointer-events-none absolute -bottom-24 left-[-10%] h-80 w-80 rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-400/20 blur-3xl dark:from-violet-500/15 dark:to-indigo-500/10"
          aria-hidden
          style={{ animationDelay: "-3s" }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3.5 py-1 text-xs font-medium tracking-[0.18em] text-zinc-600 uppercase shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-300">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {aiPage.heroEyebrow}
          </div>

          <h1 className="mt-7 max-w-4xl text-[2.5rem] leading-[1.05] font-semibold tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl dark:text-zinc-50">
            {aiPage.heroTitle.a}
            <span className="text-gradient">{aiPage.heroTitle.b}</span>
            {aiPage.heroTitle.c}
            <span className="text-gradient">{aiPage.heroTitle.d}</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300">
            {aiPage.heroDescription}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/#contact"
              className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-zinc-900 px-6 text-sm font-medium text-white shadow-[0_12px_30px_-12px_rgba(79,70,229,0.6)] transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <span className="relative z-10">AI 도입 문의</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10 transition group-hover:translate-x-0.5"
                aria-hidden
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
              />
            </Link>
            <a
              href="#pillars"
              className="inline-flex h-12 items-center rounded-full border border-zinc-300/80 bg-white/70 px-6 text-sm font-medium text-zinc-900 backdrop-blur transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              접근 방식 보기
            </a>
          </div>
        </div>
      </section>

      {/* ── Pillars ──────────────────────────────────── */}
      <section
        id="pillars"
        className="relative overflow-hidden border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950"
      >
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                Two Pillars
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                AI를 <span className="text-gradient">두 곳</span>에 둡니다
              </h2>
              <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
                만드는 자리(개발)와 일하는 자리(업무). 두 곳 모두에 AI를 자연스럽게 끼워 넣는 것이 코디움랩의 접근입니다.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {aiPage.pillars.map((p, i) => (
              <Reveal
                key={p.title}
                delay={i * 160}
                direction={i === 0 ? "left" : "right"}
                as="article"
                className="card-elevate group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-indigo-300 hover:shadow-[0_24px_60px_-30px_rgba(79,70,229,0.45)] sm:p-10 dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
                />
                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-400 uppercase dark:text-zinc-500">
                  0{i + 1} · {p.tag}
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {p.summary}
                </p>
                <p className="mt-5 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                  {p.body}
                </p>
                <ul className="mt-7 space-y-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                      />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stack ────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black">
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                Stack
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                코디움랩이 <span className="text-gradient">손에 쥔 도구</span>
              </h2>
              <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
                특정 벤더에 묶이지 않고, 그때그때 가장 좋은 결을 가진 도구를 조립합니다.
              </p>
            </div>
          </Reveal>

          <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aiPage.stack.map((s, i) => (
              <Reveal
                key={s.label}
                as="li"
                delay={i * 110}
                className="card-elevate rounded-2xl border border-zinc-200/80 bg-white p-6 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.35)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
              >
                <p className="text-xs font-semibold tracking-[0.22em] text-indigo-600 uppercase dark:text-indigo-400">
                  {s.label}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-2 inline-block h-1 w-1 flex-none rounded-full bg-zinc-400 dark:bg-zinc-500"
                      />
                      <span className="leading-relaxed">{it}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Patterns / Process ───────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                Pattern
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                <span className="text-gradient">AI 도입</span>의 네 단계
              </h2>
              <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
                결과만 가져다 붙이지 않습니다. 발견 → 시도 → 통합 → 운영, 네 단계로 함께 만듭니다.
              </p>
            </div>
          </Reveal>

          <ol className="relative mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-200/60 lg:grid-cols-4 dark:border-zinc-800/80 dark:bg-zinc-800/60">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-[88px] hidden h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent lg:block"
            />
            {aiPage.patterns.map((p, i) => (
              <Reveal
                key={p.step}
                as="li"
                delay={i * 120}
                className="relative flex flex-col gap-3 bg-white p-7 transition hover:bg-zinc-50 sm:p-9 dark:bg-zinc-950 dark:hover:bg-zinc-900/60"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-gradient text-4xl font-bold tracking-tight">
                    {p.step}
                  </span>
                  <span className="text-xs font-medium tracking-[0.22em] text-zinc-400 uppercase dark:text-zinc-500">
                    step {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {p.title}
                </h3>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {p.body}
                </p>
                <span
                  aria-hidden
                  className="absolute top-[84px] left-7 hidden h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 ring-4 ring-white lg:block dark:ring-zinc-950"
                />
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Cases ────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black">
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                Use cases
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                이런 결의 <span className="text-gradient">시스템</span>을 만듭니다
              </h2>
              <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
                도입 가능한 시나리오 — 작게 시작해 운영까지 가져갑니다.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {aiPage.cases.map((c, i) => (
              <Reveal
                key={c.title}
                as="article"
                delay={i * 130}
                className="card-elevate group relative flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-7 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.4)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
              >
                <span className="self-start rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-indigo-600 uppercase dark:bg-indigo-500/10 dark:text-indigo-300">
                  {c.tag}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {c.body}
                </p>
                <p className="mt-6 border-t border-zinc-200/80 pt-4 font-mono text-[11px] text-zinc-400 dark:border-zinc-800/80 dark:text-zinc-500">
                  {c.meta}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Principles ───────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                Principles
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                AI를 다룰 때 <span className="text-gradient">지키는 결</span>
              </h2>
            </div>
          </Reveal>
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {aiPage.principles.map((p, i) => (
              <Reveal
                key={p.title}
                as="li"
                delay={i * 130}
                className="card-elevate rounded-2xl border border-zinc-200/80 bg-white p-7 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.35)] dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
              >
                <p className="text-gradient text-3xl font-bold tracking-tight">
                  0{i + 1}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {p.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Closing CTA ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-white dark:bg-black">
        <div className="bg-mesh absolute inset-0 opacity-60" aria-hidden />
        <FloatingTokens density="light" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:py-28">
          <Reveal>
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              Let&apos;s build
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              AI가 들어갈 자리,
              <br />
              <span className="text-gradient">함께 찾아보겠습니다</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-zinc-600 dark:text-zinc-300">
              지금 팀에 정말 AI가 필요한 자리가 있는지, 무료 진단 미팅으로 함께 확인합니다.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/#contact"
                className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-zinc-900 px-7 text-sm font-medium text-white shadow-[0_12px_30px_-12px_rgba(79,70,229,0.6)] transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <span className="relative z-10">무료 진단 미팅 신청</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="relative z-10 transition group-hover:translate-x-0.5"
                  aria-hidden
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                />
              </Link>
              <Link
                href="/"
                className="inline-flex h-12 items-center rounded-full border border-zinc-300/80 bg-white/70 px-6 text-sm font-medium text-zinc-900 backdrop-blur transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
              >
                메인으로
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}
