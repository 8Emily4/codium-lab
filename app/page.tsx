import Link from "next/link";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Reveal from "@/components/Reveal";
import { homeGateways } from "@/lib/brand";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />

      <section
        id="explore"
        className="relative overflow-hidden border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950"
      >
        <div className="bg-dots absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                Explore
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                무엇을 <span className="text-gradient">먼저 보고 싶으세요?</span>
              </h2>
              <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
                여섯 가지 입구 — 어디로 들어와도 코디움랩이 어떤 결로 일하는지 보입니다.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {homeGateways.map((g, i) => (
              <Reveal
                key={g.slug}
                delay={i * 90}
                direction="up"
                as="article"
                className="card-elevate group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-7 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.4)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${g.accent}`}
                />
                <Link
                  href={g.href}
                  className="absolute inset-0"
                  aria-label={`${g.title} 더 보기`}
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
                    더 보기
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
    </>
  );
}
