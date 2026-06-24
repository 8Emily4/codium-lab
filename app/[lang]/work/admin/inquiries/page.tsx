import { notFound } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import { requireAdmin } from "@/lib/users";
import {
  getInquiry,
  listInquiries,
  listInquiryNotes,
  INQUIRY_STATUSES,
  type Inquiry,
  type InquiryStatus,
} from "@/lib/inquiries";
import { EmptyState, WorkHeader, formatDateTime } from "@/components/work/ui";
import {
  ListNavItem,
  PaneLabel,
  SplitLayout,
} from "@/components/work/layout";
import { addInquiryNoteAction, setInquiryStatusAction } from "./actions";

const T = {
  ko: {
    eyebrow: "관리",
    title: "문의 관리",
    desc: "사이트 문의를 확인하고 진행 상태를 관리합니다. 상태별로 처리 메모를 남길 수 있습니다.",
    list: "문의",
    empty: "아직 들어온 문의가 없습니다.",
    selectHint: "왼쪽에서 문의를 선택하세요.",
    org: "소속",
    phone: "연락처",
    message: "문의 내용",
    received: "접수",
    updated: "갱신",
    status: "진행 상태",
    notes: "처리 메모",
    notesEmpty: "아직 메모가 없습니다.",
    addNote: "메모 추가",
    notePlaceholder: "처리 내용·통화 결과·다음 액션 등을 기록하세요.",
    save: "저장",
    noteAt: (s: string) => `${s} 상태에서 작성`,
    replyMail: "메일 회신",
  },
  en: {
    eyebrow: "Manage",
    title: "Inquiries",
    desc: "Review site inquiries and manage their progress. You can leave handling notes per status.",
    list: "Inquiries",
    empty: "No inquiries yet.",
    selectHint: "Select an inquiry on the left.",
    org: "Org",
    phone: "Phone",
    message: "Message",
    received: "Received",
    updated: "Updated",
    status: "Status",
    notes: "Notes",
    notesEmpty: "No notes yet.",
    addNote: "Add note",
    notePlaceholder: "Record the handling, call result, next action, etc.",
    save: "Save",
    noteAt: (s: string) => `written while ${s}`,
    replyMail: "Reply by email",
  },
} as const;

const STATUS_LABEL: Record<InquiryStatus, { ko: string; en: string }> = {
  new: { ko: "미확인", en: "New" },
  inProgress: { ko: "진행 중", en: "In progress" },
  done: { ko: "완료", en: "Done" },
  archived: { ko: "보관", en: "Archived" },
};

const STATUS_BADGE: Record<InquiryStatus, string> = {
  new: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900",
  inProgress:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  done: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
  archived:
    "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700",
};

function StatusPill({
  status,
  lang,
}: {
  status: InquiryStatus;
  lang: "ko" | "en";
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${STATUS_BADGE[status]}`}
    >
      {STATUS_LABEL[status][lang]}
    </span>
  );
}

export default async function InquiriesAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { lang: rawLang } = await params;
  if (!hasLocale(rawLang)) notFound();
  const lang = rawLang === "en" ? "en" : "ko";
  const t = T[lang];

  const ctx = await requireAdmin();
  if (!ctx) notFound();

  const { id: idParam } = await searchParams;
  const inquiries = await listInquiries();

  const parsed = idParam ? Number(idParam) : NaN;
  const selectedId = Number.isInteger(parsed) ? parsed : inquiries[0]?.id;
  const selected =
    selectedId != null ? ((await getInquiry(selectedId)) ?? null) : null;
  const notes = selected ? await listInquiryNotes(selected.id) : [];

  const base = `/${lang}/work/admin/inquiries`;

  if (inquiries.length === 0) {
    return (
      <>
        <WorkHeader eyebrow={t.eyebrow} title={t.title} description={t.desc} />
        <EmptyState title={t.empty} />
      </>
    );
  }

  const aside = (
    <>
      <PaneLabel>{`${t.list} (${inquiries.length})`}</PaneLabel>
      <div className="flex flex-col gap-2">
        {inquiries.map((q) => (
          <ListNavItem
            key={q.id}
            href={`${base}?id=${q.id}`}
            active={selected?.id === q.id}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-sm font-medium">
                {q.name}
                {q.organization ? (
                  <span className="ml-1 text-xs opacity-60">
                    · {q.organization}
                  </span>
                ) : null}
              </span>
              <StatusPill status={q.status} lang={lang} />
            </div>
            <p className="mt-1 line-clamp-1 text-xs opacity-70">{q.message}</p>
            <p className="mt-1 text-[11px] opacity-50">
              {formatDateTime(q.createdAt, lang)}
              {q.noteCount > 0 ? ` · ✎ ${q.noteCount}` : ""}
            </p>
          </ListNavItem>
        ))}
      </div>
    </>
  );

  const main = selected ? (
    <Detail
      key={selected.id}
      inquiry={selected}
      notes={notes}
      lang={lang}
      t={t}
    />
  ) : (
    <EmptyState title={t.selectHint} />
  );

  return (
    <>
      <WorkHeader eyebrow={t.eyebrow} title={t.title} description={t.desc} />
      <SplitLayout aside={aside} main={main} asideWidth="320px" />
    </>
  );
}

function Detail({
  inquiry,
  notes,
  lang,
  t,
}: {
  inquiry: Inquiry;
  notes: Awaited<ReturnType<typeof listInquiryNotes>>;
  lang: "ko" | "en";
  t: (typeof T)[keyof typeof T];
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* 헤더: 이름 + 현재 상태 */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 p-5 dark:border-zinc-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {inquiry.name}
            </h2>
            <StatusPill status={inquiry.status} lang={lang} />
          </div>
          <a
            href={`mailto:${inquiry.email}`}
            className="mt-0.5 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {inquiry.email}
          </a>
        </div>
        <p className="text-xs text-zinc-400">
          {t.received} {formatDateTime(inquiry.createdAt, lang)}
        </p>
      </div>

      {/* 연락 정보 + 본문 */}
      <div className="space-y-4 p-5">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {inquiry.organization && (
            <div className="flex gap-2">
              <dt className="text-zinc-400">{t.org}</dt>
              <dd className="text-zinc-700 dark:text-zinc-200">
                {inquiry.organization}
              </dd>
            </div>
          )}
          {inquiry.phone && (
            <div className="flex gap-2">
              <dt className="text-zinc-400">{t.phone}</dt>
              <dd className="text-zinc-700 dark:text-zinc-200">
                {inquiry.phone}
              </dd>
            </div>
          )}
        </dl>

        <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/50">
          <p className="mb-1 text-xs font-medium text-zinc-400">{t.message}</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-zinc-100">
            {inquiry.message}
          </p>
        </div>

        <a
          href={`mailto:${inquiry.email}?subject=${encodeURIComponent(
            "[코디움랩] 문의 회신",
          )}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 5L2 7" />
          </svg>
          {t.replyMail}
        </a>
      </div>

      {/* 진행 상태 변경 */}
      <div className="border-t border-zinc-100 p-5 dark:border-zinc-800">
        <p className="mb-2 text-xs font-medium text-zinc-400">{t.status}</p>
        <div className="flex flex-wrap gap-1.5">
          {INQUIRY_STATUSES.map((s) => {
            const active = inquiry.status === s;
            return (
              <form key={s} action={setInquiryStatusAction}>
                <input type="hidden" name="id" value={inquiry.id} />
                <input type="hidden" name="status" value={s} />
                <input type="hidden" name="lang" value={lang} />
                <button
                  type="submit"
                  aria-current={active ? "true" : undefined}
                  disabled={active}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
                    active
                      ? STATUS_BADGE[s]
                      : "bg-white text-zinc-500 ring-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  {STATUS_LABEL[s][lang]}
                </button>
              </form>
            );
          })}
        </div>
      </div>

      {/* 처리 메모 */}
      <div className="border-t border-zinc-100 p-5 dark:border-zinc-800">
        <p className="mb-3 text-xs font-medium text-zinc-400">
          {t.notes} ({notes.length})
        </p>

        <form action={addInquiryNoteAction} className="mb-4">
          <input type="hidden" name="id" value={inquiry.id} />
          <input type="hidden" name="status" value={inquiry.status} />
          <input type="hidden" name="lang" value={lang} />
          <textarea
            name="body"
            required
            rows={2}
            placeholder={t.notePlaceholder}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {t.save}
            </button>
          </div>
        </form>

        {notes.length === 0 ? (
          <p className="text-xs text-zinc-400">{t.notesEmpty}</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-950/40"
              >
                <p className="text-sm whitespace-pre-wrap text-zinc-800 dark:text-zinc-100">
                  {n.body}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                  <span>{formatDateTime(n.createdAt, lang)}</span>
                  {n.authorName && <span>· {n.authorName}</span>}
                  {n.status && (
                    <span className="opacity-80">
                      · {t.noteAt(STATUS_LABEL[n.status][lang])}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
