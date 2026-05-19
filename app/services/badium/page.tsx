import Link from "next/link";
import type { Metadata } from "next";
import { company, courses, subBrands } from "@/lib/brand";

const brand = subBrands.find((b) => b.slug === "badium")!;
const badiumCourses = courses.filter((c) => c.brand === "badium");

export const metadata: Metadata = {
  title: `Badium · ${brand.tagline} | ${company.nameKo}`,
  description: brand.description,
};

const services = [
  {
    title: "라벨 · 네임 스티커",
    body: "브랜드 톤에 맞춘 라벨·네임 스티커 디자인부터 인쇄 발주까지. 1매부터 시즌 단위 대량 발주까지 모두 받습니다.",
  },
  {
    title: "패키지 · 박스 디자인",
    body: "AI 시안 + 디자이너 손맛으로 ‘열어보고 싶은 패키지’를 만듭니다. 1차 소비재·홈베이커리·공방을 위한 단가 친화 라인업.",
  },
  {
    title: "굿즈 · 시즌 캠페인",
    body: "브랜드·캠페인 단위로 굿즈 라인업을 함께 설계합니다. AI 디자인 자산을 일관된 굿즈로 옮기는 데 강합니다.",
  },
  {
    title: "소상공인 비주얼 브랜딩",
    body: "간판·메뉴판·SNS 콘텐츠 한 세트. 동네 가게·1인 카페·공방을 위한 ‘한 번에 깔끔해지는’ 브랜딩 패키지.",
  },
];

const portfolio = [
  {
    title: "동네 베이커리 라벨 리브랜딩",
    tag: "Bakery · Label",
    body: "5평 동네 베이커리의 라벨·태그·패키지를 한 세트로 4주에 리브랜딩한 프로젝트.",
  },
  {
    title: "프리미엄 가향차 패키지",
    tag: "F&B · Packaging",
    body: "AI 일러스트와 인쇄 톤 캘리브레이션을 결합해 6종 라인업을 한 톤으로 묶었습니다.",
  },
  {
    title: "독립 작가 굿즈 시즌 캠페인",
    tag: "Goods · Campaign",
    body: "스티커·엽서·머그 3종 라인업을 시즌별로 리프레시. 자사몰 전환율 1.8배 상승.",
  },
];

export default function BadiumPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] h-80 w-80 rounded-full bg-gradient-to-br from-fuchsia-400/30 to-rose-400/20 blur-3xl dark:from-fuchsia-500/20 dark:to-rose-500/10"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs font-medium tracking-[0.18em] text-zinc-600 uppercase backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
            Badium · {brand.tagline}
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl leading-tight font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            손에 잡히는
            <br />
            <span className="bg-gradient-to-r from-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
              감각적인 디자인
            </span>
            을 짓는 곳
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300">
            {brand.description}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 px-6 text-sm font-medium text-white"
            >
              디자인 협업 문의
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
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/academy?brand=badium"
              className="inline-flex h-12 items-center rounded-full border border-zinc-300 bg-white/70 px-6 text-sm font-medium text-zinc-900 backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100"
            >
              베이디움 과정 신청
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <p className="text-sm font-medium tracking-[0.2em] text-fuchsia-600 uppercase dark:text-fuchsia-400">
            Services
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            네 결의 디자인 작업
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
            라벨 한 장부터 시즌 캠페인까지. 베이디움이 다루는 디자인의 결입니다.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {services.map((s) => (
              <article
                key={s.title}
                className="rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {s.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <p className="text-sm font-medium tracking-[0.2em] text-fuchsia-600 uppercase dark:text-fuchsia-400">
            Portfolio
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            대표 협업 사례
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {portfolio.map((p, i) => (
              <article
                key={p.title}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-fuchsia-200 via-rose-200 to-amber-100 dark:from-fuchsia-500/30 dark:via-rose-500/30 dark:to-amber-500/20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.55),transparent_55%)]" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium tracking-[0.18em] text-zinc-700 uppercase backdrop-blur dark:bg-zinc-950/80 dark:text-zinc-200">
                    Case 0{i + 1}
                  </span>
                </div>
                <div className="p-7">
                  <p className="text-xs font-medium tracking-[0.22em] text-fuchsia-600 uppercase dark:text-fuchsia-400">
                    {p.tag}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                    {p.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-[0.2em] text-fuchsia-600 uppercase dark:text-fuchsia-400">
                Courses
              </p>
              <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
                디자인 창업을 위한 과정
              </h2>
            </div>
            <Link
              href="/academy?brand=badium"
              className="hidden text-sm font-medium text-fuchsia-600 hover:underline sm:inline-block dark:text-fuchsia-400"
            >
              전체 과정 보기 →
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {badiumCourses.map((c) => (
              <article
                key={c.id}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="text-xs font-medium tracking-[0.22em] text-fuchsia-600 uppercase dark:text-fuchsia-400">
                  Badium · {c.level}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {c.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  {c.subtitle}
                </p>
                <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {c.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full bg-fuchsia-50 px-2.5 py-0.5 text-xs text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-end justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {c.duration}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {c.price}
                    </p>
                  </div>
                  <Link
                    href={`/academy?course=${c.id}`}
                    className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 px-4 text-sm font-medium text-white"
                  >
                    신청하기
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-black">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-fuchsia-50 via-white to-rose-50 p-10 sm:p-12 dark:border-zinc-800 dark:from-fuchsia-500/10 dark:via-zinc-950 dark:to-rose-500/10">
            <p className="text-sm font-medium tracking-[0.2em] text-fuchsia-600 uppercase dark:text-fuchsia-400">
              Let&apos;s craft together
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              디자인 협업이 필요하신가요?
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
              브랜드 톤·예산·일정·인쇄 환경을 한 페이지로 정리해 보내주시면, 영업일
              기준 1–2일 안에 1차 디자인 방향과 견적을 회신드립니다.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex h-12 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              디자인 협업 문의
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
