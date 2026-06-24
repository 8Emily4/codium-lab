import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/**
 * 운영 워크스페이스 공용 레이아웃 프리미티브.
 *
 * 모든 admin 페이지가 "왼쪽 리스트 + 오른쪽 상세"라는 동일한 골격을 쓰도록 강제한다.
 * 페이지마다 grid/카드/액션바 마크업을 복붙하면 형태가 어긋나므로, 여기 한 곳에서만 정의한다.
 *
 * - SplitLayout : 페이지 2분할 골격(스티키 리스트 + 상세)
 * - PaneLabel   : 양쪽 패널 상단의 소형 대문자 라벨
 * - ListNavItem : 왼쪽 리스트의 선택 가능한 항목(활성/비활성 토글)
 * - DetailShell : 오른쪽 상세 카드(탭 헤더 + 본문 + 하단 고정 액션바)
 * - FieldGrid   : 본문 필드 그리드(모바일 1열 → sm 이상 2열, wide 필드는 전체폭)
 * - Field       : 라벨 + 입력 + 에러 한 세트
 *
 * 폼 입력 스타일도 여기서 단일 소스로 관리(inputCls/inputErrCls/labelCls).
 */

/** 폼 입력 공통 스타일 — 모든 폼이 동일한 입력칸 외형을 갖도록 한 곳에서 관리. */
export const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
export const inputErrCls =
  "w-full rounded-lg border border-rose-400 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500/70 dark:bg-zinc-950 dark:text-zinc-100";
export const labelCls =
  "mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400";

/** 페이지 2분할 골격: 왼쪽 리스트(데스크톱에서 스티키) + 오른쪽 상세. */
export function SplitLayout({
  aside,
  main,
  asideWidth = "300px",
}: {
  aside: ReactNode;
  main: ReactNode;
  /** 리스트 열 너비. 기본 300px(자료 열람만 320px 등). */
  asideWidth?: string;
}) {
  return (
    <div
      className="grid gap-5 xl:grid-cols-[var(--aside-w)_1fr]"
      style={{ "--aside-w": asideWidth } as CSSProperties}
    >
      <aside className="xl:sticky xl:top-20 xl:self-start">{aside}</aside>
      <section className="min-w-0">{main}</section>
    </div>
  );
}

/** 양쪽 패널 상단의 소형 대문자 라벨(예: "자료 (32)"). */
export function PaneLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 line-clamp-1 px-1 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
      {children}
    </p>
  );
}

/** 왼쪽 리스트의 선택 가능한 항목. active일 때 반전 색. */
export function ListNavItem({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl border p-3 transition ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
      }`}
    >
      {children}
    </Link>
  );
}

/**
 * 오른쪽 상세 카드.
 * - tabs   : 탭 바에 들어갈 노드(없으면 탭 바 자체를 숨김)
 * - footer : 하단 고정 액션바 콘텐츠(없으면 액션바 숨김)
 * - children : 본문
 */
export function DetailShell({
  tabs,
  footer,
  children,
}: {
  tabs?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {tabs && (
        <div className="flex gap-1 border-b border-zinc-200 px-4 pt-3 sm:px-6 dark:border-zinc-800">
          {tabs}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
      {footer && (
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-b-2xl border-t border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/90">
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * 상세 카드의 탭 버튼. DetailShell의 tabs 슬롯에서 사용.
 */
export function DetailTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-selected={active}
      role="tab"
      className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "border-indigo-500 text-zinc-900 dark:text-zinc-50"
          : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * 본문 필드 그리드. 모바일 1열 → sm 이상 2열.
 * 긴 필드(본문/요약 등)는 Field에 wide를 주면 전체폭(col-span-2)으로 떨어진다.
 */
export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

/** 라벨 + 입력(children) + 에러 한 세트. wide면 그리드에서 전체폭. */
export function Field({
  label,
  error,
  wide,
  children,
}: {
  label: string;
  error?: string;
  /** 전체폭(2열 그리드에서 col-span-2). */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label className={labelCls}>{label}</label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}
