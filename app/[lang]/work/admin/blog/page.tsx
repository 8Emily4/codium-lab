import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import { requireAdmin } from "@/lib/users";
import { listAllPosts } from "@/lib/blog";
import { isBlogNavVisible } from "@/lib/settings";
import { Card, EmptyState, WorkHeader } from "@/components/work/ui";
import {
  createPostAction,
  deletePostAction,
  setBlogNavAction,
  updatePostAction,
} from "./actions";
import PostCreateForm from "./PostCreateForm";

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
  required: string;
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
    required: "필수 입력입니다",
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
    required: "This field is required",
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

export default async function WorkBlogAdmin({
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

  // Admin or super-admin only.
  const ctx = await requireAdmin();
  if (!ctx) notFound();

  const base = `/${lang}/work/admin/blog`;
  const [items, navVisible] = await Promise.all([
    listAllPosts(),
    isBlogNavVisible(),
  ]);

  const isNew = id === "new";
  const editing = !isNew && id ? items.find((p) => String(p.id) === id) : null;

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

      <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
        {/* 목록 */}
        <aside className="xl:sticky xl:top-20 xl:self-start">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
              {t.listTitle} ({items.length})
            </p>
            <Link
              href={`${base}?id=new`}
              className="inline-flex h-7 items-center rounded-full bg-zinc-900 px-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              + {t.newTitle}
            </Link>
          </div>

          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 px-3 py-6 text-center text-xs text-zinc-400 dark:border-zinc-700">
              {t.empty}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((item) => {
                const active = String(item.id) === id;
                return (
                  <li key={item.id}>
                    <Link
                      href={`${base}?id=${item.id}`}
                      className={`flex items-center gap-3 rounded-xl border p-2 transition ${
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        {item.thumbnail ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                            {t.noPreview}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <span className={`text-[10px] ${active ? "text-zinc-300 dark:text-zinc-600" : item.published ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                            {item.published ? t.shown : t.hidden}
                          </span>
                          {item.featured && (
                            <span className={`text-[10px] ${active ? "text-amber-200 dark:text-amber-700" : "text-amber-500"}`}>
                              ★ {t.featured}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* 상세 */}
        <section className="min-w-0">
          {(isNew || editing) && (
            <p className="mb-2 line-clamp-1 px-1 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
              {isNew ? t.newTitle : editing!.title}
            </p>
          )}
          {isNew ? (
            <PostCreateForm
              action={createPostAction}
              lang={lang}
              f={t.f}
              create={t.create}
              save={t.save}
              del={t.del}
              required={t.required}
            />
          ) : editing ? (
            <PostCreateForm
              action={updatePostAction}
              deleteAction={deletePostAction}
              lang={lang}
              f={t.f}
              create={t.create}
              save={t.save}
              del={t.del}
              required={t.required}
              item={{
                id: editing.id,
                title: editing.title,
                slug: editing.slug,
                summary: editing.summary,
                body: editing.body,
                thumbnail: editing.thumbnail,
                tags: editing.tags,
                published: editing.published,
                featured: editing.featured,
              }}
            />
          ) : (
            <EmptyState title={t.empty} />
          )}
        </section>
      </div>
    </>
  );
}
