import Link from "next/link";
import { company } from "@/lib/brand";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black"
    >
      <div className="bg-mesh absolute inset-0" aria-hidden />
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div
        className="anim-float pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/30 to-fuchsia-400/20 blur-3xl dark:from-indigo-500/20 dark:to-fuchsia-500/10"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs font-medium tracking-[0.18em] text-zinc-600 uppercase backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-300">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
          {company.nameEn} · since {company.foundedYear}
        </div>

        <h1 className="mt-6 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-zinc-50">
          기술의 본질을 연구하고
          <br />
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            가치를 구현
          </span>
          하는 IT 솔루션 연구소
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 whitespace-pre-line text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300">
          {company.description}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/contact"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            컨설팅·협업 문의
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition group-hover:translate-x-0.5"
              aria-hidden
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="#brands"
            className="inline-flex h-12 items-center rounded-full border border-zinc-300 bg-white/70 px-6 text-sm font-medium text-zinc-900 backdrop-blur transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
          >
            브랜드 둘러보기
          </a>
        </div>

      </div>
    </section>
  );
}
