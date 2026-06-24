import Link from "next/link";
import type { MaterialStatus } from "@/lib/materials";

export function WorkHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.18em] text-indigo-500 uppercase dark:text-indigo-400">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-[28px] dark:text-zinc-50">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

const STATUS_STYLE: Record<MaterialStatus, string> = {
  draft:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  published:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
  archived:
    "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700",
};

export function StatusBadge({
  status,
  lang,
}: {
  status: MaterialStatus;
  lang: string;
}) {
  const labels =
    lang === "en"
      ? { draft: "Draft", published: "Published", archived: "Archived" }
      : { draft: "초안", published: "공개", archived: "보관" };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${STATUS_STYLE[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/50 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-zinc-400 dark:text-zinc-500">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function formatDate(unixSeconds: number, lang: string): string {
  try {
    return new Date(unixSeconds * 1000).toLocaleDateString(
      lang === "en" ? "en-US" : "ko-KR",
      { year: "numeric", month: "short", day: "numeric" },
    );
  } catch {
    return "";
  }
}

export function formatDateTime(unixSeconds: number, lang: string): string {
  try {
    return new Date(unixSeconds * 1000).toLocaleString(
      lang === "en" ? "en-US" : "ko-KR",
      { dateStyle: "medium", timeStyle: "short" },
    );
  } catch {
    return "";
  }
}
