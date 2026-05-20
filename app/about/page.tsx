import Link from "next/link";
import type { Metadata } from "next";
import { company } from "@/lib/brand";

export const metadata: Metadata = {
  title: `ABOUT | ${company.nameKo}`,
  description: company.vision.body,
};

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="bg-mesh absolute inset-0" aria-hidden />
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            About
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            {company.vision.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300">
            {company.vision.body}
          </p>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Three Pillars
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            연구 · 교육 · 크래프트, 세 개의 축
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
            코디움랩은 AI 연구의 결과를 한 단계씩 일상에 옮깁니다. 본질을 연구하고,
            가르치고, 손에 잡히게 만듭니다.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {company.vision.pillars.map((p, idx) => (
              <article
                key={p.label}
                className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                  0{idx + 1}
                </p>
                <p className="mt-1 text-xs font-medium tracking-[0.22em] text-zinc-500 uppercase dark:text-zinc-400">
                  {p.label}
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Way of working
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            우리가 일하는 방식
          </h2>

          <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {company.philosophy.map((item, idx) => (
              <li
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                  0{idx + 1}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 sm:p-12 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              Next step
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              어떤 방향으로 시작해볼까요?
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
              교육이 먼저인지, 디자인 협업이 먼저인지, 자동화 컨설팅이 먼저인지
              — 가장 맞는 결로 안내해드립니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/services/adium"
                className="inline-flex h-12 items-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 text-sm font-medium text-white"
              >
                Adium · AI 교육 보기
              </Link>
              <Link
                href="/services/badium"
                className="inline-flex h-12 items-center rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 px-6 text-sm font-medium text-white"
              >
                Badium · 디자인 보기
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                문의 보내기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
