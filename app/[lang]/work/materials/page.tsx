import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../dictionaries";
import { getSessionWithRole } from "@/lib/users";
import {
  getMaterialForViewer,
  listMaterialsForViewer,
  type ViewerAccessState,
} from "@/lib/materials";
import { company } from "@/lib/brand";
import {
  EmptyState,
  WorkHeader,
  formatDate,
  formatDateTime,
} from "@/components/work/ui";
import Markdown from "@/components/work/Markdown";
import MaterialPresentation from "@/components/work/MaterialPresentation";

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
    fromBadge: (d: string) => `${d}부터`,
    expiredBadge: "기간 만료",
    upcomingBadge: "열람 예정",
    back: "목록",
    list: "자료 목록",
    emptyDoc: "_(빈 문서)_",
    expiredTitle: "열람 기간이 만료되었습니다",
    expiredDesc:
      "이 자료를 다시 열람하려면 관리자에게 문의해 주세요. 기간을 연장해 드릴 수 있습니다.",
    upcomingTitle: "아직 열람 시작 전입니다",
    upcomingDesc: (d: string) => `${d}부터 열람할 수 있습니다.`,
    contact: "관리자에게 문의",
    mailSubject: (title: string) => `[강의자료 열람 문의] ${title}`,
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
    fromBadge: (d: string) => `From ${d}`,
    expiredBadge: "Expired",
    upcomingBadge: "Upcoming",
    back: "List",
    list: "Materials",
    emptyDoc: "_(empty document)_",
    expiredTitle: "Your access has expired",
    expiredDesc:
      "Please contact an administrator to view this material again — your access can be extended.",
    upcomingTitle: "Access hasn't started yet",
    upcomingDesc: (d: string) => `Available from ${d}.`,
    contact: "Contact an admin",
    mailSubject: (title: string) => `[Material access] ${title}`,
  },
} as const;

/** Small status pill for a material in the list / header. */
function accessBadge(
  state: ViewerAccessState,
  endsAt: number | null,
  startsAt: number | null,
  lang: string,
  t: (typeof T)[keyof typeof T],
): { text: string; tone: "active" | "expired" | "upcoming" } | null {
  if (state === "expired") return { text: t.expiredBadge, tone: "expired" };
  if (state === "upcoming")
    return {
      text: startsAt ? t.fromBadge(formatDate(startsAt, lang)) : t.upcomingBadge,
      tone: "upcoming",
    };
  // open — only show a pill when there's an end date to count down to.
  if (endsAt) return { text: t.until(formatDate(endsAt, lang)), tone: "active" };
  return null;
}

const BADGE_TONE = {
  active:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300",
  expired:
    "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300",
  upcoming:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
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
  const selectedMeta = selectedId
    ? (list.find((m) => m.id === selectedId) ?? null)
    : null;
  const isOpen = selectedMeta?.accessState === "open";
  // Only fetch the body when the viewer may actually read it. getMaterialForViewer
  // re-checks the grant window server-side, so locked content never reaches here.
  const selected =
    selectedMeta && isOpen
      ? await getMaterialForViewer(selectedMeta.id, session.id, role)
      : null;

  const headerBadge = selectedMeta
    ? accessBadge(
        selectedMeta.accessState,
        selectedMeta.accessEndsAt,
        selectedMeta.accessStartsAt,
        lang,
        t,
      )
    : null;

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
                const locked = m.accessState !== "open";
                const badge = accessBadge(
                  m.accessState,
                  m.accessEndsAt,
                  m.accessStartsAt,
                  lang,
                  t,
                );
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
                      <p className="flex items-center gap-1.5 text-sm font-semibold">
                        {locked && (
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                            className={`shrink-0 ${active ? "" : "text-zinc-400"}`}
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        )}
                        <span className="line-clamp-1">{m.title}</span>
                      </p>
                      {m.summary && (
                        <p
                          className={`mt-0.5 line-clamp-1 text-xs ${active ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}
                        >
                          {m.summary}
                        </p>
                      )}
                      {badge && (
                        <p
                          className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            active ? "bg-white/15 text-current" : BADGE_TONE[badge.tone]
                          }`}
                        >
                          {badge.text}
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
            {selectedMeta ? (
              <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {selectedMeta.title}
                  </h2>
                  {isOpen && selected && (
                    <MaterialPresentation
                      lang={lang}
                      title={selectedMeta.title}
                      summary={selectedMeta.summary}
                      tags={selectedMeta.tags}
                      body={selected.body}
                    />
                  )}
                </div>
                {selectedMeta.summary && (
                  <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                    {selectedMeta.summary}
                  </p>
                )}
                {(selectedMeta.tags.length > 0 || headerBadge) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {selectedMeta.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        #{tag}
                      </span>
                    ))}
                    {headerBadge && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_TONE[headerBadge.tone]}`}
                      >
                        {headerBadge.text}
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                  {isOpen && selected ? (
                    <Markdown>{selected.body || t.emptyDoc}</Markdown>
                  ) : (
                    <LockedNotice
                      state={selectedMeta.accessState}
                      startsAt={selectedMeta.accessStartsAt}
                      title={selectedMeta.title}
                      lang={lang}
                      t={t}
                    />
                  )}
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

function LockedNotice({
  state,
  startsAt,
  title,
  lang,
  t,
}: {
  state: ViewerAccessState;
  startsAt: number | null;
  title: string;
  lang: string;
  t: (typeof T)[keyof typeof T];
}) {
  const expired = state === "expired";
  const heading = expired ? t.expiredTitle : t.upcomingTitle;
  const desc = expired
    ? t.expiredDesc
    : t.upcomingDesc(startsAt ? formatDateTime(startsAt, lang) : "");
  const mailHref = `mailto:${company.contactEmail}?subject=${encodeURIComponent(
    t.mailSubject(title),
  )}`;

  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-950/40">
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
          expired
            ? "bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-300"
            : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
        }`}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {heading}
      </p>
      <p className="mt-1.5 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        {desc}
      </p>
      {expired && (
        <a
          href={mailHref}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 5L2 7" />
          </svg>
          {t.contact}
        </a>
      )}
    </div>
  );
}
