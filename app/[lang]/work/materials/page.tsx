import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../dictionaries";
import { getSessionWithRole } from "@/lib/users";
import {
  getMaterialForViewer,
  listMaterialsForViewer,
} from "@/lib/materials";
import { EmptyState, WorkHeader, formatDate } from "@/components/work/ui";
import Markdown from "@/components/work/Markdown";

const T = {
  ko: {
    eyebrow: "강의자료",
    title: "강의자료",
    descAdmin: "전체 자료를 미리 봅니다. 등록·접근권한은 [자료 관리]에서.",
    descUser: "내게 열람 권한이 있는 자료입니다.",
    empty: "열람 가능한 자료가 없습니다",
    emptyDesc: "관리자가 접근권한을 부여하면 여기에 표시됩니다.",
    pick: "왼쪽에서 자료를 선택하세요.",
    noAccess: "이 자료에 접근할 권한이 없습니다.",
    until: (d: string) => `${d}까지 열람 가능`,
    back: "목록",
    list: "자료 목록",
  },
  en: {
    eyebrow: "Materials",
    title: "Materials",
    descAdmin: "Preview every material. Manage them under [Manage Materials].",
    descUser: "Materials you currently have access to.",
    empty: "No materials available",
    emptyDesc: "They'll appear here once an admin grants you access.",
    pick: "Select a material on the left.",
    noAccess: "You don't have access to this material.",
    until: (d: string) => `Available until ${d}`,
    back: "List",
    list: "Materials",
  },
} as const;

export default async function MaterialsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { id } = await searchParams;
  const t = T[lang === "en" ? "en" : "ko"];

  const ctx = await getSessionWithRole();
  if (!ctx) notFound();
  const { session, role } = ctx;
  const isAdmin = role === "admin" || role === "superAdmin";
  const base = `/${lang}/work/materials`;

  const list = await listMaterialsForViewer(session.id, role);
  const selectedId = id ?? list[0]?.id;
  const selected = selectedId
    ? await getMaterialForViewer(selectedId, session.id, role)
    : null;
  const selectedMeta = list.find((m) => m.id === selectedId);

  return (
    <>
      <WorkHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={isAdmin ? t.descAdmin : t.descUser}
      />

      {list.length === 0 ? (
        <EmptyState title={t.empty} description={t.emptyDesc} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          {/* List */}
          <aside
            className={`${id ? "hidden lg:block" : "block"} lg:sticky lg:top-20 lg:self-start`}
          >
            <p className="mb-2 px-1 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
              {t.list}
            </p>
            <ul className="flex flex-col gap-2">
              {list.map((m) => {
                const active = m.id === selectedId;
                return (
                  <li key={m.id}>
                    <Link
                      href={`${base}?id=${m.id}`}
                      scroll={false}
                      className={`block rounded-xl border p-3.5 transition ${
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                      }`}
                    >
                      <p className="line-clamp-1 text-sm font-semibold">
                        {m.title}
                      </p>
                      {m.summary && (
                        <p
                          className={`mt-0.5 line-clamp-1 text-xs ${active ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}
                        >
                          {m.summary}
                        </p>
                      )}
                      {m.accessEndsAt && (
                        <p
                          className={`mt-2 text-[11px] font-medium ${active ? "text-indigo-200 dark:text-indigo-700" : "text-indigo-500 dark:text-indigo-400"}`}
                        >
                          {t.until(formatDate(m.accessEndsAt, lang))}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Detail */}
          <section className={`${id ? "block" : "hidden lg:block"}`}>
            {id && (
              <Link
                href={base}
                className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 lg:hidden"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m15 18-6-6 6-6" />
                </svg>
                {t.back}
              </Link>
            )}
            {selected ? (
              <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {selected.title}
                </h2>
                {selected.summary && (
                  <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                    {selected.summary}
                  </p>
                )}
                {(selected.tags.length > 0 || selectedMeta?.accessEndsAt) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {selected.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        #{tag}
                      </span>
                    ))}
                    {selectedMeta?.accessEndsAt && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                        ⏳ {t.until(formatDate(selectedMeta.accessEndsAt, lang))}
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                  <Markdown>{selected.body || "_(빈 문서)_"}</Markdown>
                </div>
              </article>
            ) : (
              <EmptyState title={selectedId ? t.noAccess : t.pick} />
            )}
          </section>
        </div>
      )}
    </>
  );
}
