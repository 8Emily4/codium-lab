import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { getDictionary, hasLocale } from "../../dictionaries";
import { notFound } from "next/navigation";
import { subBrands } from "@/lib/brand";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.about.metaTitle,
    description: dict.about.metaDesc,
    alternates: { canonical: `/${lang}/about` },
    openGraph: { title: dict.about.metaTitle, description: dict.about.metaDesc, url: `/${lang}/about` },
  };
}

const tagColors = [
  "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300",
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
];

const whatAccents = [
  "from-indigo-500 to-violet-500",
  "from-violet-500 to-fuchsia-500",
  "from-fuchsia-500 to-rose-500",
  "from-emerald-500 to-sky-500",
];

const brandAccents: Record<string, string> = {
  adium: "from-indigo-500 to-violet-500",
  badium: "from-fuchsia-500 to-rose-500",
};

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { about } = dict;

  return (
    <>
      <PageHeader
        eyebrow={about.eyebrow}
        title={about.title}
        highlight={about.titleHighlight}
        description={about.desc}
        cta={
          <>
            <Link
              href={`/${lang}/services`}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {about.ctaServices}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex h-12 items-center rounded-full border border-zinc-300/80 bg-white/70 px-6 text-sm font-medium text-zinc-900 backdrop-blur transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              {about.ctaContact}
            </Link>
          </>
        }
      />

      {/* Team section */}
      <section className="relative border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black">
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              {about.teamEyebrow}
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              {about.teamTitle}{" "}
              <span className="text-gradient">{about.teamTitleHighlight}</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[about.damon, about.nari].map((member, i) => (
              <Reveal
                key={member.name}
                delay={i * 150}
                direction={i === 0 ? "left" : "right"}
                className="card-elevate group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-8 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.4)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
                    i === 0 ? "from-indigo-500 to-violet-500" : "from-fuchsia-500 to-rose-500"
                  }`}
                />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-400 uppercase dark:text-zinc-500">
                      {member.role}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {member.name}
                    </h3>
                  </div>
                  <div
                    aria-hidden
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-lg font-bold ${
                      i === 0 ? "from-indigo-500 to-violet-500" : "from-fuchsia-500 to-rose-500"
                    }`}
                  >
                    {member.name[0]}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {member.desc}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {member.tags.map((tag, ti) => (
                    <span
                      key={tag}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${tagColors[ti % tagColors.length]}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What we do section */}
      <section className="relative border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              {about.whatEyebrow}
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              {about.whatTitle}{" "}
              <span className="text-gradient">{about.whatTitleHighlight}</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {about.whatItems.map((item, i) => (
              <Reveal
                key={item.tag}
                delay={i * 100}
                direction="up"
                as="article"
                className="card-elevate group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-7 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.35)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${whatAccents[i]}`}
                />
                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-400 uppercase dark:text-zinc-500">
                  {item.tag}
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {item.desc}
                </p>
                {i === 0 && (
                  <Link
                    href={`/${lang}/ai`}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    {about.whatItemsLinkText}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </Link>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Brands section */}
      <section className="relative border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black">
        <div className="bg-mesh absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              {about.brandsEyebrow}
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              {about.brandsTitle}{" "}
              <span className="text-gradient">{about.brandsTitleHighlight}</span>
            </h2>
            <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-300">
              {about.brandsDesc}
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {subBrands.map((brand, i) => (
              <Reveal
                key={brand.slug}
                delay={i * 160}
                direction={i === 0 ? "left" : "right"}
                as="article"
                className="card-elevate group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-8 dark:border-zinc-800/80 dark:bg-zinc-950"
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${brandAccents[brand.slug]}`}
                />
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${brandAccents[brand.slug]} text-white text-sm font-bold`}
                  >
                    {brand.nameEn[0]}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-400 uppercase dark:text-zinc-500">
                      {brand.tagline}
                    </p>
                    <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {lang === "en" ? brand.nameEn : brand.nameKo}
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {brand.description}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {brand.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-indigo-500" aria-hidden>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="relative border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              {about.closingTitle}{" "}
              <span className="text-gradient">{about.closingTitleHighlight}</span>
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-300">
              {about.closingDesc}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href={`/${lang}/contact`}
                className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-zinc-900 px-7 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <span className="relative z-10">{about.ctaContact}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition group-hover:translate-x-0.5" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
                <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
              <Link
                href={`/${lang}/services`}
                className="inline-flex h-12 items-center rounded-full border border-zinc-300/80 bg-white/70 px-7 text-sm font-medium text-zinc-900 backdrop-blur transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
              >
                {about.ctaServices}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
