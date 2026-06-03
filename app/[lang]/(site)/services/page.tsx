import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { getDictionary, hasLocale } from "../../dictionaries";
import { notFound } from "next/navigation";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.services.metaTitle,
    description: dict.services.metaDesc,
    alternates: { canonical: `/${lang}/services` },
    openGraph: { title: dict.services.metaTitle, description: dict.services.metaDesc, url: `/${lang}/services` },
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { services } = dict;

  return (
    <>
      <PageHeader
        eyebrow={services.eyebrow}
        title={services.title}
        highlight={services.titleHighlight}
        description={services.desc}
        cta={
          <>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {services.ctaInquiry}
            </Link>
            <Link
              href={`/${lang}/process`}
              className="inline-flex h-12 items-center rounded-full border border-zinc-300/80 bg-white/70 px-6 text-sm font-medium text-zinc-900 backdrop-blur transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              {services.ctaProcess}
            </Link>
          </>
        }
      />

      <section className="relative border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              {services.detailEyebrow}
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              {services.detailTitle} <span className="text-gradient">{services.detailTitleHighlight}</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {services.deepServices.map((svc, i) => (
              <Reveal
                key={svc.title}
                as="article"
                delay={i * 140}
                direction={i % 2 === 0 ? "left" : "right"}
                className="card-elevate group relative flex flex-col rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-indigo-300 hover:shadow-[0_24px_60px_-30px_rgba(79,70,229,0.4)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
              >
                <span className="self-start rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-indigo-600 uppercase dark:bg-indigo-500/10 dark:text-indigo-300">
                  {svc.tag}
                </span>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {svc.title}
                </h3>
                <p className="mt-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {svc.summary}
                </p>
                <p className="mt-4 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                  {svc.body}
                </p>
                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-zinc-200/80 pt-6 sm:grid-cols-2 dark:border-zinc-800/80">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
                      {services.deliverablesLabel}
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                      {svc.deliverables.map((d) => (
                        <li key={d} className="flex items-start gap-2">
                          <span aria-hidden className="mt-2 inline-block h-1 w-1 flex-none rounded-full bg-zinc-400 dark:bg-zinc-500" />
                          <span className="leading-relaxed">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
                        {services.timelineLabel}
                      </p>
                      <p className="mt-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {svc.timeline}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
                        {services.bestForLabel}
                      </p>
                      <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                        {svc.idealFor}
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
              {services.engagementEyebrow}
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              <span className="text-gradient">{services.engagementTitleHighlight}</span>{services.engagementTitlePost}
            </h2>
            <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-300">
              {services.engagementDesc}
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {services.models.map((m, i) => (
              <Reveal
                key={m.name}
                delay={i * 130}
                className="card-elevate group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-7 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.4)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
              >
                <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
                <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {m.name}
                </h3>
                <p className="mt-2 text-gradient text-2xl font-bold tracking-tight">
                  {m.price}
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                  {m.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <span aria-hidden className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href={`/${lang}/contact`}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-7 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {services.engagementCta}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Dev approach teaser */}
      <Reveal
        as="section"
        className="relative border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950"
      >
        <div className="bg-dots absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <Link
            href={`/${lang}/ai`}
            className="group flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-[11px] font-semibold tracking-[0.24em] text-indigo-600 uppercase dark:text-indigo-400">
                {services.aiTeaserEyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {services.aiTeaserTitle}
                <span className="text-gradient">{services.aiTeaserHighlight}</span>
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {services.aiTeaserDesc}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-indigo-600 transition group-hover:gap-3 dark:text-indigo-400">
              {services.aiTeaserCta}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="transition group-hover:translate-x-0.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </Reveal>
    </>
  );
}
