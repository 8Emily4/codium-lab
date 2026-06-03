import type { Metadata } from "next";
import Link from "next/link";
import FloatingTokens from "@/components/FloatingTokens";
import CodeTyper from "@/components/CodeTyper";
import Reveal from "@/components/Reveal";
import HarnessDiagram from "@/components/HarnessDiagram";
import { getDictionary, hasLocale } from "../../dictionaries";
import { notFound } from "next/navigation";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.ai.metaTitle,
    description: dict.ai.metaDesc,
    alternates: { canonical: `/${lang}/ai` },
    openGraph: { title: dict.ai.metaTitle, description: dict.ai.metaDesc, url: `/${lang}/ai` },
  };
}

export default async function AiPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { ai } = dict;

  return (
    <>
      {/* Hero */}
      <section id="ai-top" className="relative overflow-hidden border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black">
        <div className="bg-mesh absolute inset-0" aria-hidden />
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="bg-noise" aria-hidden />
        <FloatingTokens density="light" mask="right-half" lang={lang} />
        <CodeTyper position="topRight" startIdx={0} />
        <CodeTyper position="bottomRight" startIdx={2} />
        <div className="anim-float pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/30 to-fuchsia-400/20 blur-3xl dark:from-indigo-500/20 dark:to-fuchsia-500/10" aria-hidden />
        <div className="anim-float pointer-events-none absolute -bottom-24 left-[-10%] h-80 w-80 rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-400/20 blur-3xl dark:from-violet-500/15 dark:to-indigo-500/10" aria-hidden style={{ animationDelay: "-3s" }} />

        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3.5 py-1 text-xs font-medium tracking-[0.18em] text-zinc-600 uppercase shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-300">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {ai.heroEyebrow}
          </div>
          <h1 className="mt-7 max-w-4xl text-[2.5rem] leading-[1.05] font-semibold tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl dark:text-zinc-50">
            {ai.heroTitleA}<span className="text-gradient">{ai.heroTitleB}</span>{ai.heroTitleC}<span className="text-gradient">{ai.heroTitleD}</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300">
            {ai.heroDesc}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href={`/${lang}/contact`} className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-zinc-900 px-6 text-sm font-medium text-white shadow-[0_12px_30px_-12px_rgba(79,70,229,0.6)] transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
              <span className="relative z-10">{ai.ctaInquiry}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition group-hover:translate-x-0.5" aria-hidden><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
            <a href="#pillars" className="inline-flex h-12 items-center rounded-full border border-zinc-300/80 bg-white/70 px-6 text-sm font-medium text-zinc-900 backdrop-blur transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900">
              {ai.ctaApproach}
            </a>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section id="pillars" className="relative overflow-hidden border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">{ai.pillarsEyebrow}</p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                {ai.pillarsTitle} <span className="text-gradient">{ai.pillarsTitleHighlight}</span>{ai.pillarsTitlePost}
              </h2>
              <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">{ai.pillarsDesc}</p>
            </div>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {ai.pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 160} direction={i === 0 ? "left" : "right"} as="article" className="card-elevate group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-indigo-300 hover:shadow-[0_24px_60px_-30px_rgba(79,70,229,0.45)] sm:p-10 dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50">
                <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-400 uppercase dark:text-zinc-500">0{i + 1} · {p.tag}</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">{p.title}</h3>
                <p className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">{p.summary}</p>
                <p className="mt-5 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">{p.body}</p>
                <ul className="mt-7 space-y-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span aria-hidden className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="relative overflow-hidden border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black">
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">{ai.stackEyebrow}</p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                {ai.stackTitle} <span className="text-gradient">{ai.stackTitleHighlight}</span>
              </h2>
              <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">{ai.stackDesc}</p>
            </div>
          </Reveal>
          <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ai.stack.map((s, i) => (
              <Reveal key={s.label} as="li" delay={i * 110} className="card-elevate rounded-2xl border border-zinc-200/80 bg-white p-6 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.35)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50">
                <p className="text-xs font-semibold tracking-[0.22em] text-indigo-600 uppercase dark:text-indigo-400">{s.label}</p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <span aria-hidden className="mt-2 inline-block h-1 w-1 flex-none rounded-full bg-zinc-400 dark:bg-zinc-500" />
                      <span className="leading-relaxed">{it}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Patterns */}
      <section className="relative overflow-hidden border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">{ai.patternsEyebrow}</p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                <span className="text-gradient">{ai.patternsTitleHighlight}</span> {ai.patternsTitlePost}
              </h2>
              <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">{ai.patternsDesc}</p>
            </div>
          </Reveal>
          <ol className="relative mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-200/60 lg:grid-cols-4 dark:border-zinc-800/80 dark:bg-zinc-800/60">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[88px] hidden h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent lg:block" />
            {ai.patterns.map((p, i) => (
              <Reveal key={p.step} as="li" delay={i * 120} className="relative flex flex-col gap-3 bg-white p-7 transition hover:bg-zinc-50 sm:p-9 dark:bg-zinc-950 dark:hover:bg-zinc-900/60">
                <div className="flex items-baseline gap-3">
                  <span className="text-gradient text-4xl font-bold tracking-tight">{p.step}</span>
                  <span className="text-xs font-medium tracking-[0.22em] text-zinc-400 uppercase dark:text-zinc-500">step {i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{p.title}</h3>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{p.body}</p>
                <span aria-hidden className="absolute top-[84px] left-7 hidden h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 ring-4 ring-white lg:block dark:ring-zinc-950" />
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Cases */}
      <section className="relative overflow-hidden border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black">
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">{ai.casesEyebrow}</p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                {ai.casesTitle} <span className="text-gradient">{ai.casesTitleHighlight}</span>{ai.casesTitlePost}
              </h2>
              <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">{ai.casesDesc}</p>
            </div>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {ai.cases.map((c, i) => (
              <Reveal key={c.title} as="article" delay={i * 130} className="card-elevate group relative flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-7 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.4)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50">
                <span className="self-start rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-indigo-600 uppercase dark:bg-indigo-500/10 dark:text-indigo-300">{c.tag}</span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{c.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{c.body}</p>
                <p className="mt-6 border-t border-zinc-200/80 pt-4 font-mono text-[11px] text-zinc-400 dark:border-zinc-800/80 dark:text-zinc-500">{c.meta}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Harness Pipeline */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-zinc-900 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-grid absolute inset-0 opacity-10" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-transparent to-fuchsia-950/20" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium tracking-[0.2em] text-indigo-400 uppercase">{ai.harnessEyebrow}</p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.15em] text-emerald-400 uppercase">
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  LIVE
                </span>
              </div>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
                {ai.harnessTitle} <span className="text-gradient">{ai.harnessTitleHighlight}</span>{ai.harnessTitlePost}
              </h2>
              <p className="max-w-2xl text-zinc-400">{ai.harnessDesc}</p>
            </div>
          </Reveal>

          {/* Pipeline diagram */}
          <div className="mt-12">
            <p className="mb-5 text-[10px] font-semibold tracking-[0.25em] text-zinc-500 uppercase">{ai.harnessDiagramLabel}</p>
            <HarnessDiagram stages={ai.harnessDiagramStages} />
          </div>

          {/* Capability cards */}
          <div className="mt-14">
            <Reveal>
              <p className="mb-8 text-sm font-medium tracking-[0.2em] text-indigo-400 uppercase">{ai.harnessCapabilitiesTitle}</p>
            </Reveal>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ai.harnessCapabilities.map((cap, i) => (
                <Reveal key={cap.tag} as="li" delay={i * 100} className="card-elevate rounded-2xl border border-zinc-700/50 bg-zinc-800/40 p-6 hover:border-indigo-500/50 hover:bg-zinc-800/60">
                  <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-indigo-400 uppercase">{cap.tag}</span>
                  <h3 className="mt-4 text-base font-semibold text-zinc-100">{cap.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{cap.body}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="relative overflow-hidden border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">{ai.principlesEyebrow}</p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                {ai.principlesTitle} <span className="text-gradient">{ai.principlesTitleHighlight}</span>
              </h2>
            </div>
          </Reveal>
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {ai.principles.map((p, i) => (
              <Reveal key={p.title} as="li" delay={i * 130} className="card-elevate rounded-2xl border border-zinc-200/80 bg-white p-7 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.35)] dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:border-indigo-500/50">
                <p className="text-gradient text-3xl font-bold tracking-tight">0{i + 1}</p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{p.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-white dark:bg-black">
        <div className="bg-mesh absolute inset-0 opacity-60" aria-hidden />
        <FloatingTokens density="light" lang={lang} />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:py-28">
          <Reveal>
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">{ai.closingEyebrow}</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              {ai.closingTitle}<br />
              <span className="text-gradient">{ai.closingTitleHighlight}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-zinc-600 dark:text-zinc-300">{ai.closingDesc}</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href={`/${lang}/contact`} className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-zinc-900 px-7 text-sm font-medium text-white shadow-[0_12px_30px_-12px_rgba(79,70,229,0.6)] transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                <span className="relative z-10">{ai.closingCtaPrimary}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition group-hover:translate-x-0.5" aria-hidden><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
              <Link href={`/${lang}`} className="inline-flex h-12 items-center rounded-full border border-zinc-300/80 bg-white/70 px-6 text-sm font-medium text-zinc-900 backdrop-blur transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900">
                {ai.closingCtaSecondary}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
