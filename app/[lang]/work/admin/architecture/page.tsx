import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import { requireAdmin } from "@/lib/users";
import { WorkHeader } from "@/components/work/ui";
import ArchitectureTabs from "@/components/work/ArchitectureTabs";

export const metadata: Metadata = {
  title: "아키텍처",
  robots: { index: false, follow: false },
};

const STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "Turso · libSQL",
  "Zod",
  "Vercel",
];

export default async function ArchitecturePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // 관리자 및 슈퍼관리자만 접근 가능
  const ctx = await requireAdmin();
  if (!ctx) notFound();

  return (
    <>
      <WorkHeader
        eyebrow="관리 · 아키텍처"
        title="코디움랩 아키텍처"
        description="코디움랩이 어떤 기술 스택과 구조, 데이터 모델로 만들어졌는지 한눈에 확인할 수 있는 관리자 전용 문서입니다."
      />

      <div className="mb-8 flex flex-wrap gap-2">
        {STACK.map((s) => (
          <span
            key={s}
            className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {s}
          </span>
        ))}
      </div>

      <ArchitectureTabs />
    </>
  );
}
