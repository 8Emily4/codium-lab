import Link from "next/link";
import Hero from "@/components/Hero";
import BrandShowcase from "@/components/BrandShowcase";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <>
      <Hero />

      <BrandShowcase />

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
