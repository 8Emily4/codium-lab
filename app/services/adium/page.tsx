import Link from "next/link";
import type { Metadata } from "next";
import { company, courses, subBrands } from "@/lib/brand";

const brand = subBrands.find((b) => b.slug === "adium")!;
const adiumCourses = courses.filter((c) => c.brand === "adium");

export const metadata: Metadata = {
  title: `Adium · ${brand.tagline} | ${company.nameKo}`,
  description: brand.description,
};

const audiences = [
  {
    title: "공부하는 주부",
    body: "두 번째 커리어를 준비 중인 학습형 주부들. AI로 직접 콘텐츠·강의·부업을 시도해보고 싶은 분들에게 가장 빠른 입문선을 제공합니다.",
  },
  {
    title: "예비 인플루언서",
    body: "릴스·쇼츠를 다음 단계로 끌어올리고 싶은 크리에이터. AI 대본·이미지·편집을 결합한 ‘운영 가능한’ 채널 워크플로를 만듭니다.",
  },
  {
    title: "현장의 강사들",
    body: "학교·학원·기업에서 가르치는 분들. 강의 자료 자동 생성, 과제 보조, 학생 피드백까지 ‘수업의 30%를 줄이는 AI 활용법’을 직접 익힙니다.",
  },
];

const curriculumGroups = [
  {
    label: "FOUNDATION",
    title: "AI 리터러시 기초",
    items: ["프롬프트의 원리", "모델별 강·약점 이해", "보안과 윤리"],
  },
  {
    label: "CREATION",
    title: "AI 콘텐츠 생성",
    items: ["AI 숏폼 기획·제작", "이미지 생성과 톤 통일", "음성·자막 자동화"],
  },
  {
    label: "OPERATION",
    title: "업무 자동화 운영",
    items: ["n8n · Make · GPTs 설계", "1인 사업 워크플로", "팀 자동화 도입"],
  },
];

export default function AdiumPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/30 to-violet-400/20 blur-3xl dark:from-indigo-500/20 dark:to-violet-500/10"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs font-medium tracking-[0.18em] text-zinc-600 uppercase backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Adium · {brand.tagline}
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl leading-tight font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            공부하는 사람을 위한
            <br />
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              디지털 스케일업
            </span>{" "}
            공간
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 whitespace-pre-line text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300">
            {brand.description}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/academy?brand=adium"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 text-sm font-medium text-white"
            >
              에이디움 과정 신청
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
              href="/contact"
              className="inline-flex h-12 items-center rounded-full border border-zinc-300 bg-white/70 px-6 text-sm font-medium text-zinc-900 backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100"
            >
              단체 교육 견적
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Who it's for
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            이런 분들이 가장 빠르게 성장합니다
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {audiences.map((a) => (
              <article
                key={a.title}
                className="rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {a.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {a.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Curriculum
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            세 단계로 설계된 AI 커리큘럼
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
            기초 → 콘텐츠 생성 → 자동화 운영. 코디움랩의 실무 노하우를
            ‘운영 가능한 수준’까지 단계별로 옮깁니다.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {curriculumGroups.map((g, i) => (
              <article
                key={g.label}
                className="rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                  STAGE 0{i + 1}
                </p>
                <p className="mt-1 text-xs font-medium tracking-[0.22em] text-zinc-500 uppercase dark:text-zinc-400">
                  {g.label}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {g.title}
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                  {g.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />
                      {it}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                Courses
              </p>
              <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
                지금 신청할 수 있는 과정
              </h2>
            </div>
            <Link
              href="/academy?brand=adium"
              className="hidden text-sm font-medium text-indigo-600 hover:underline sm:inline-block dark:text-indigo-400"
            >
              전체 과정 보기 →
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {adiumCourses.map((c) => (
              <article
                key={c.id}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="text-xs font-medium tracking-[0.22em] text-indigo-600 uppercase dark:text-indigo-400">
                  Adium · {c.level}
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
                      className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
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
                    className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 text-sm font-medium text-white"
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
          <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-10 sm:p-12 dark:border-zinc-800 dark:from-indigo-500/10 dark:via-zinc-950 dark:to-violet-500/10">
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              Need a custom track?
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              우리 팀에만 맞춘 AI 교육이 필요하신가요?
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
              부서별·도메인별 데이터에 맞춰 사례 중심의 워크샵을 설계해드립니다.
              임원·실무자·창작자 트랙을 분리해 운영합니다.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex h-12 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              단체 교육 견적 문의
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
