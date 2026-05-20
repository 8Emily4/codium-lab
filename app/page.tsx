import Link from "next/link";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import BrandShowcase from "@/components/BrandShowcase";
import FAQ from "@/components/FAQ";
import { company } from "@/lib/brand";

export default function Home() {
  return (
    <>
      <Hero />

      <BrandShowcase />

      <Services />
      <Process />

      <section
        id="philosophy"
        className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              Philosophy
            </p>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              코디움랩이 일하는 방식
            </h2>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {company.philosophy.map((item, idx) => (
              <li
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
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

      <FAQ />

      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-24">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Get in touch
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            함께 만들고 싶은 디지털 비즈니스가 있다면
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-300">
            비즈니스 제휴, 외부 강의, 굿즈 협업 — 어떤 결의 협업이든 코디움랩이
            한 지붕 아래에서 받습니다.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-full bg-zinc-900 px-7 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              문의 보내기
            </Link>
            <Link
              href="/academy"
              className="inline-flex h-12 items-center rounded-full border border-zinc-300 bg-white px-7 text-sm font-medium text-zinc-900 transition hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500"
            >
              교육 신청하기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
