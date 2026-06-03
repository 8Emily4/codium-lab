import Link from "next/link";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import FAQ from "@/components/FAQ";
import Reveal from "@/components/Reveal";
import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { home } = dict;

  return (
    <>
      <Hero lang={lang} dict={dict} />

      <section
        id="explore"
        className="relative overflow-hidden border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950"
      >
        <div className="bg-dots absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                {home.exploreEyebrow}
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                {home.exploreTitle}{" "}
                <span className="text-gradient">{home.exploreTitleHighlight}</span>
                {home.exploreTitlePost}
              </h2>
              <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
                {home.exploreDesc}
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {home.gateways.map((g, i) => (
              <Reveal
                key={g.slug}
                delay={i * 90}
                direction="up"
                as="article"
                className="card-elevate group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-7 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.4)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
                    [
                      "from-indigo-500 to-violet-500",
                      "from-violet-500 to-fuchsia-500",
                      "from-fuchsia-500 to-rose-500",
                      "from-indigo-500 to-fuchsia-500",
                      "from-emerald-500 to-indigo-500",
                      "from-zinc-700 to-zinc-900",
                    ][i]
                  }`}
                />
                <Link
                  href={`/${lang}/${g.slug}`}
                  className="absolute inset-0"
                  aria-label={`${g.title} ${home.readMore}`}
                />
                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-400 uppercase dark:text-zinc-500">
                  {g.eyebrow}
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {g.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {g.description}
                </p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <span className="underline-offset-4 group-hover:underline">
                    {home.readMore}
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
                    aria-hidden
                    className="transition group-hover:translate-x-0.5"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Services dict={dict} />
      <Process dict={dict} />
      <FAQ dict={dict} />
    </>
  );
}
