import type { Metadata } from "next";
import { company } from "@/lib/brand";
import ArchiveBrowser from "@/components/ArchiveBrowser";

export const metadata: Metadata = {
  title: `Archive · 아카이브 | ${company.nameKo}`,
  description:
    "AI 트렌드, 디지털 팁, 프로젝트 포트폴리오까지 — 코디움랩의 연구와 협업 기록을 한 곳에서 확인하세요.",
};

export default function ArchivePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="bg-mesh absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Archive · Blog
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            연구와 협업의 기록
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300">
            AI 트렌드, 실무자에게 바로 쓸모 있는 디지털 팁, 그리고 에이디움·베이디움의
            프로젝트 포트폴리오까지. 코디움랩의 살아 있는 노트입니다.
          </p>
        </div>
      </section>

      <ArchiveBrowser />
    </>
  );
}
