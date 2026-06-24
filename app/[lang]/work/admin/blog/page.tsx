import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import { requireAdmin } from "@/lib/users";
import { listAllPosts, type BlogPost } from "@/lib/blog";
import { isBlogNavVisible } from "@/lib/settings";
import { Card, EmptyState, WorkHeader, formatDateTime } from "@/components/work/ui";
import {
  createPostAction,
  deletePostAction,
  setBlogNavAction,
  togglePostFlagAction,
  updatePostAction,
} from "./actions";

export const dynamic = "force-dynamic";

type Strings = {
  eyebrow: string;
  title: string;
  desc: string;
  viewPage: string;
  navTitle: string;
  navDesc: string;
  navOn: string;
  navOff: string;
  navTurnOn: string;
  navTurnOff: string;
  newTitle: string;
  create: string;
  listTitle: string;
  empty: string;
  noPreview: string;
  edit: string;
  save: string;
  del: string;
  hide: string;
  show: string;
  feature: string;
  unfeature: string;
  shown: string;
  hidden: string;
  featured: string;
  f: {
    title: string;
    titlePh: string;
    slug: string;
    slugHint: string;
    slugPh: string;
    summary: string;
    summaryPh: string;
    body: string;
    bodyHint: string;
    bodyPh: string;
    thumb: string;
    thumbPh: string;
    tags: string;
    tagsHint: string;
    tagsPh: string;
    publish: string;
    feature: string;
  };
};

const T: Record<"ko" | "en", Strings> = {
  ko: {
    eyebrow: "관리",
    title: "기술블로그 관리",
    desc: "마크다운으로 글을 작성하면 공개 기술블로그 페이지에 정리되어 노출됩니다.",
    viewPage: "블로그 페이지 보기",
    navTitle: "메뉴 노출",
    navDesc: "상단 콘텐츠 메뉴에 ‘기술블로그’를 표시할지 결정합니다.",
    navOn: "메뉴에 노출 중",
    navOff: "메뉴에서 숨김",
    navTurnOn: "메뉴에 노출하기",
    navTurnOff: "메뉴에서 숨기기",
    newTitle: "새 글 작성",
    create: "발행하기",
    listTitle: "작성된 글",
    empty: "아직 작성된 글이 없습니다.",
    noPreview: "이미지 없음",
    edit: "수정 / 삭제",
    save: "저장",
    del: "이 글 삭제",
    hide: "비공개",
    show: "공개",
    feature: "추천",
    unfeature: "추천 해제",
    shown: "공개",
    hidden: "비공개",
    featured: "추천",
    f: {
      title: "제목 *",
      titlePh: "글 제목",
      slug: "주소(slug)",
      slugHint: "(비우면 제목에서 자동 생성)",
      slugPh: "my-first-post",
      summary: "요약",
      summaryPh: "목록 카드에 보일 한두 줄 요약 (선택)",
      body: "본문 *",
      bodyHint: "(마크다운 지원: 제목 #, 목록 -, 코드 ```, 표 등)",
      bodyPh: "## 들어가며\n\n여기에 마크다운으로 글을 작성하세요…",
      thumb: "썸네일 URL",
      thumbPh: "https://...jpg (선택)",
      tags: "태그",
      tagsHint: "(쉼표로 구분)",
      tagsPh: "Next.js, 아키텍처, AI",
      publish: "공개(발행)",
      feature: "추천으로 상단 고정",
    },
  },
  en: {
    eyebrow: "Manage",
    title: "Tech Blog",
    desc: "Write posts in markdown; they appear neatly on the public tech-blog page.",
    viewPage: "View blog page",
    navTitle: "Menu visibility",
    navDesc: "Choose whether ‘Tech Blog’ shows in the top content menu.",
    navOn: "Shown in menu",
    navOff: "Hidden from menu",
    navTurnOn: "Show in menu",
    navTurnOff: "Hide from menu",
    newTitle: "New post",
    create: "Publish",
    listTitle: "Posts",
    empty: "No posts yet.",
    noPreview: "No image",
    edit: "Edit / delete",
    save: "Save",
    del: "Delete this post",
    hide: "Unpublish",
    show: "Publish",
    feature: "Feature",
    unfeature: "Unfeature",
    shown: "Published",
    hidden: "Draft",
    featured: "Featured",
    f: {
      title: "Title *",
      titlePh: "Post title",
      slug: "Slug",
      slugHint: "(auto-generated from the title if blank)",
      slugPh: "my-first-post",
      summary: "Summary",
      summaryPh: "A line or two shown on the list card (optional)",
      body: "Body *",
      bodyHint: "(markdown: # headings, - lists, ``` code, tables…)",
      bodyPh: "## Intro\n\nWrite your post in markdown here…",
      thumb: "Thumbnail URL",
      thumbPh: "https://...jpg (optional)",
      tags: "Tags",
      tagsHint: "(comma separated)",
      tagsPh: "Next.js, architecture, AI",
      publish: "Publish",
      feature: "Pin as featured",
    },
  },
};

const INPUT =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";
const LABEL =
  "mb-1.5 block text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-300";

function PostFields({ t, item }: { t: Strings; item?: BlogPost }) {
  const f = t.f;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>{f.title}</label>
          <input name="title" required defaultValue={item?.title ?? ""} placeholder={f.titlePh} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>
            {f.slug} <span className="font-normal text-zinc-400">{f.slugHint}</span>
          </label>
          <input name="slug" defaultValue={item?.slug ?? ""} placeholder={f.slugPh} className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL}>{f.summary}</label>
        <textarea name="summary" rows={2} defaultValue={item?.summary ?? ""} placeholder={f.summaryPh} className={`${INPUT} resize-y`} />
      </div>

      <div>
        <label className={LABEL}>
          {f.body} <span className="font-normal text-zinc-400">{f.bodyHint}</span>
        </label>
        <textarea name="body" rows={item ? 12 : 14} required defaultValue={item?.body ?? ""} placeholder={f.bodyPh} className={`${INPUT} resize-y font-mono text-[13px] leading-6`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>{f.thumb}</label>
          <input name="thumbnail" type="url" defaultValue={item?.thumbnail ?? ""} placeholder={f.thumbPh} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>
            {f.tags} <span className="font-normal text-zinc-400">{f.tagsHint}</span>
          </label>
          <input name="tags" defaultValue={item?.tags.join(", ") ?? ""} placeholder={f.tagsPh} className={INPUT} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 pt-1">
        <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input type="checkbox" name="published" defaultChecked={item ? item.published : true} className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600" />
          {f.publish}
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input type="checkbox" name="featured" defaultChecked={item?.featured ?? false} className="h-4 w-4 rounded border-zinc-300 text-fuchsia-600 focus:ring-fuchsia-500 dark:border-zinc-600" />
          {f.feature}
        </label>
      </div>
    </>
  );
}

export default async function WorkBlogAdmin({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = T[lang === "en" ? "en" : "ko"];

  // Admin or super-admin only.
  const ctx = await requireAdmin();
  if (!ctx) notFound();

  const [items, navVisible] = await Promise.all([
    listAllPosts(),
    isBlogNavVisible(),
  ]);

  return (
    <>
      <WorkHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.desc}
        action={
          <Link
            href={`/${lang}/blog`}
            target="_blank"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path d="M15 3h6v6M10 14 21 3" />
            </svg>
            {t.viewPage}
          </Link>
        }
      />

      {/* Menu visibility toggle */}
      <Card className="mb-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              navVisible
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {navVisible ? (
                <>
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.12 9.12 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </>
              )}
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {t.navTitle}
              <span
                className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
                  navVisible
                    ? "bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60"
                    : "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700"
                }`}
              >
                {navVisible ? t.navOn : t.navOff}
              </span>
            </p>
            <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
              {t.navDesc}
            </p>
          </div>
        </div>
        <form action={setBlogNavAction} className="shrink-0">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="value" value={navVisible ? "0" : "1"} />
          <button
            type="submit"
            className={`inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold transition ${
              navVisible
                ? "border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            }`}
          >
            {navVisible ? t.navTurnOff : t.navTurnOn}
          </button>
        </form>
      </Card>

      {/* Create */}
      <Card className="mb-8 p-6">
        <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          {t.newTitle}
        </h2>
        <form action={createPostAction} className="space-y-4">
          <input type="hidden" name="lang" value={lang} />
          <PostFields t={t} />
          <div className="pt-1">
            <button type="submit" className="inline-flex items-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
              {t.create}
            </button>
          </div>
        </form>
      </Card>

      {/* List */}
      <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
        {t.listTitle} <span className="text-zinc-400">{items.length}</span>
      </h2>

      {items.length === 0 ? (
        <EmptyState title={t.empty} />
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="overflow-hidden">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-20 sm:w-36 dark:bg-zinc-800">
                    {item.thumbnail ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                        {t.noPreview}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      {item.featured && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60">
                          {t.featured}
                        </span>
                      )}
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${item.published ? "bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60" : "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700"}`}>
                        {item.published ? t.shown : t.hidden}
                      </span>
                    </div>
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</p>
                    <a href={`/${lang}/blog/${item.slug}`} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-zinc-400 underline-offset-2 hover:underline">
                      /{lang}/blog/{item.slug}
                    </a>
                    <p className="mt-0.5 text-[11px] text-zinc-400">{formatDateTime(item.createdAt, lang)}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <form action={togglePostFlagAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="flag" value="published" />
                      <input type="hidden" name="value" value={item.published ? "0" : "1"} />
                      <button type="submit" className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                        {item.published ? t.hide : t.show}
                      </button>
                    </form>
                    <form action={togglePostFlagAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="flag" value="featured" />
                      <input type="hidden" name="value" value={item.featured ? "0" : "1"} />
                      <button type="submit" className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                        {item.featured ? t.unfeature : t.feature}
                      </button>
                    </form>
                  </div>
                </div>

                <details className="group border-t border-zinc-100 dark:border-zinc-800">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                    {t.edit}
                  </summary>
                  <div className="space-y-4 border-t border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                    <form action={updatePostAction} className="space-y-4">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="lang" value={lang} />
                      <PostFields t={t} item={item} />
                      <div className="pt-1">
                        <button type="submit" className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500">
                          {t.save}
                        </button>
                      </div>
                    </form>
                    <form action={deletePostAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="lang" value={lang} />
                      <button type="submit" className="text-xs font-medium text-red-600 underline-offset-4 hover:underline dark:text-red-400">
                        {t.del}
                      </button>
                    </form>
                  </div>
                </details>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
