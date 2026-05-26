import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BrandCard from "@/components/BrandCard";
import Reveal from "@/components/Reveal";
import { brandsPage, company, subBrands } from "@/lib/brand";

export const metadata: Metadata = {
  title: "브랜드",
  description:
    "코디움랩이 운영하는 두 결의 브랜드 — 에이디움(AI 리터러시 교육)과 베이디움(디지털 굿즈 스튜디오).",
  alternates: { canonical: "/brands" },
  openGraph: {
    title: `브랜드 · ${company.nameKo}`,
    description:
      "코디움랩이 운영하는 두 결의 브랜드 — 에이디움과 베이디움.",
    url: "/brands",
  },
};

export default function BrandsPage() {
  return (
    <>
      <PageHeader
        eyebrow={brandsPage.eyebrow}
        title={brandsPage.title}
        highlight={brandsPage.highlight}
        description={brandsPage.description}
        cta={
          <>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              브랜드 협업 문의
            </Link>
            <Link
              href="/services"
              className="inline-flex h-12 items-center rounded-full border border-zinc-300/80 bg-white/70 px-6 text-sm font-medium text-zinc-900 backdrop-blur transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              서비스 보기
            </Link>
          </>
        }
      />

      <section className="relative border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {subBrands.map((brand, i) => (
              <Reveal
                key={brand.slug}
                delay={i * 160}
                direction={i === 0 ? "left" : "right"}
              >
                <BrandCard brand={brand} index={i} />
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
              Why two brands
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              왜 <span className="text-gradient">두 결</span>로 나누었나
            </h2>
          </Reveal>
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {brandsPage.whyTwo.map((item, i) => (
              <Reveal
                key={item.title}
                as="li"
                delay={i * 130}
                className="card-elevate rounded-2xl border border-zinc-200/80 bg-white p-7 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.35)] dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
              >
                <p className="text-gradient text-3xl font-bold tracking-tight">
                  0{i + 1}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              Collaborate
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              브랜드와의 <span className="text-gradient">협업 방식</span>
            </h2>
          </Reveal>
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {brandsPage.collab.map((item, i) => (
              <Reveal
                key={item.title}
                as="li"
                delay={i * 140}
                direction={i === 0 ? "left" : "right"}
                className="card-elevate rounded-2xl border border-zinc-200/80 bg-white p-8 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.35)] dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
              >
                <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </ul>

          <div className="mt-14 text-center">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-7 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              브랜드 협업 문의하기
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
