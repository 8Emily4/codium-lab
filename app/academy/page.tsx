import type { Metadata } from "next";
import { company } from "@/lib/brand";
import AcademyBrowser from "@/components/AcademyBrowser";

export const metadata: Metadata = {
  title: `Academy · 수강 신청 | ${company.nameKo}`,
  description:
    "에이디움(AI 숏폼·자동화) · 베이디움(디자인 창업) 과정을 코디움랩 통합 결제로 한 번에 신청하세요.",
};

export default function AcademyPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="bg-mesh absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Academy
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            에이디움 ·{" "}
            <span className="bg-gradient-to-r from-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
              베이디움
            </span>
            을 한 번에 신청하세요
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300">
            AI 숏폼·자동화부터 디자인 창업까지. 코디움랩 통합 결제로 두 브랜드의
            모든 과정을 한 장바구니에서 관리할 수 있습니다.
          </p>
        </div>
      </section>

      <AcademyBrowser />

      <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Notice
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            수강 신청 안내
          </h2>
          <ul className="mt-8 space-y-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            <li>
              · 코디움랩 통합 결제 시스템에서 에이디움/베이디움 과정을 한 번에
              결제하실 수 있습니다.
            </li>
            <li>
              · 개강 7일 전까지 100% 환불, 개강 후 1주 내 50% 환불 정책이 적용됩니다.
            </li>
            <li>
              · 10명 이상 단체·기업 교육은 별도 견적과 커리큘럼 맞춤이 가능합니다.{" "}
              <a
                href="/contact"
                className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
              >
                문의하기
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
