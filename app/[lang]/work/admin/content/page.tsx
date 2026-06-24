import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import { requireAdmin } from "@/lib/users";
import {
  listAllChannels,
  listAllMedia,
  resolveThumbnail,
  type MediaChannel,
  type MediaType,
} from "@/lib/media";
import { Card, EmptyState, WorkHeader } from "@/components/work/ui";
import ChannelForm from "./ChannelForm";
import MediaForm from "./MediaForm";
import {
  createChannelAction,
  createMediaAction,
  deleteChannelAction,
  deleteMediaAction,
  toggleChannelFlagAction,
  updateMediaAction,
} from "./actions";

export const dynamic = "force-dynamic";

type Strings = {
  eyebrow: string;
  title: string;
  desc: string;
  viewPage: string;
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
    type: string;
    typeYoutube: string;
    typeInstagram: string;
    typeOther: string;
    title: string;
    titlePh: string;
    url: string;
    urlPh: string;
    desc: string;
    descPh: string;
    thumb: string;
    thumbHint: string;
    thumbPh: string;
    tags: string;
    tagsHint: string;
    tagsPh: string;
    publish: string;
    feature: string;
  };
  ch: {
    title: string;
    desc: string;
    inputLabel: string;
    inputPh: string;
    add: string;
    listTitle: string;
    empty: string;
    visit: string;
    del: string;
    autoNote: string;
  };
};

const T: Record<"ko" | "en", Strings> = {
  ko: {
    eyebrow: "관리",
    title: "콘텐츠 관리",
    desc: "유튜브·인스타그램 등 제작한 콘텐츠를 등록하면 공개 콘텐츠 페이지에 정리되어 노출됩니다.",
    viewPage: "콘텐츠 페이지 보기",
    newTitle: "새 콘텐츠 등록",
    create: "등록하기",
    listTitle: "등록된 콘텐츠",
    empty: "아직 등록된 콘텐츠가 없습니다.",
    noPreview: "미리보기 없음",
    edit: "수정 / 삭제",
    save: "저장",
    del: "이 콘텐츠 삭제",
    hide: "숨기기",
    show: "노출",
    feature: "추천",
    unfeature: "추천 해제",
    shown: "노출 중",
    hidden: "숨김",
    featured: "추천",
    required: "필수 입력입니다",
    f: {
      type: "종류",
      typeYoutube: "YouTube 영상",
      typeInstagram: "Instagram 게시물",
      typeOther: "기타 (블로그/틱톡 등)",
      title: "제목 *",
      titlePh: "콘텐츠 제목",
      url: "URL *",
      urlPh: "https://youtube.com/watch?v=..., https://instagram.com/p/...",
      desc: "설명",
      descPh: "콘텐츠를 한두 줄로 소개해 주세요 (선택)",
      thumb: "썸네일 URL",
      thumbHint: "(유튜브는 자동, 인스타·기타는 권장)",
      thumbPh: "https://...jpg (선택)",
      tags: "태그",
      tagsHint: "(쉼표로 구분)",
      tagsPh: "AI, 쇼츠, 브이로그",
      publish: "페이지에 노출",
      feature: "추천으로 상단 고정",
    },
    ch: {
      title: "유튜브 채널",
      desc: "채널을 등록하면 그 채널의 최신 영상이 콘텐츠 페이지에 자동으로 노출됩니다. 영상마다 따로 등록할 필요가 없어요.",
      inputLabel: "채널 URL 또는 @핸들",
      inputPh: "https://youtube.com/@핸들  또는  @핸들",
      add: "채널 등록",
      listTitle: "등록된 채널",
      empty: "아직 등록된 채널이 없습니다.",
      visit: "채널 보기",
      del: "삭제",
      autoNote: "최신 영상 자동 노출",
    },
  },
  en: {
    eyebrow: "Manage",
    title: "Content",
    desc: "Register YouTube, Instagram and other content; it appears neatly on the public content page.",
    viewPage: "View content page",
    newTitle: "Add content",
    create: "Add",
    listTitle: "Registered content",
    empty: "No content yet.",
    noPreview: "No preview",
    edit: "Edit / delete",
    save: "Save",
    del: "Delete this item",
    hide: "Hide",
    show: "Show",
    feature: "Feature",
    unfeature: "Unfeature",
    shown: "Published",
    hidden: "Hidden",
    featured: "Featured",
    required: "This field is required",
    f: {
      type: "Type",
      typeYoutube: "YouTube video",
      typeInstagram: "Instagram post",
      typeOther: "Other (blog/TikTok…)",
      title: "Title *",
      titlePh: "Content title",
      url: "URL *",
      urlPh: "https://youtube.com/watch?v=..., https://instagram.com/p/...",
      desc: "Description",
      descPh: "A line or two about this content (optional)",
      thumb: "Thumbnail URL",
      thumbHint: "(auto for YouTube, recommended otherwise)",
      thumbPh: "https://...jpg (optional)",
      tags: "Tags",
      tagsHint: "(comma separated)",
      tagsPh: "AI, shorts, vlog",
      publish: "Show on page",
      feature: "Pin as featured",
    },
    ch: {
      title: "YouTube channels",
      desc: "Register a channel and its latest uploads appear on the content page automatically — no need to add each video.",
      inputLabel: "Channel URL or @handle",
      inputPh: "https://youtube.com/@handle  or  @handle",
      add: "Add channel",
      listTitle: "Registered channels",
      empty: "No channels yet.",
      visit: "Open channel",
      del: "Delete",
      autoNote: "Latest videos auto-shown",
    },
  },
};

const TYPE_BADGE: Record<MediaType, string> = {
  youtube:
    "bg-red-50 text-red-600 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/60",
  instagram:
    "bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:ring-fuchsia-900/60",
  other:
    "bg-indigo-50 text-indigo-600 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60",
};
const TYPE_LABEL: Record<MediaType, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  other: "Link",
};

export default async function WorkContentAdmin({
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

  const base = `/${lang}/work/admin/content`;
  const [items, channels] = await Promise.all([
    listAllMedia(),
    listAllChannels(),
  ]);

  const isNew = id === "new";
  const editing = !isNew && id ? items.find((m) => String(m.id) === id) : null;

  return (
    <>
      <WorkHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.desc}
        action={
          <Link
            href={`/${lang}/media`}
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

      {/* YouTube channels — auto feed */}
      <Card className="mb-6 p-6">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            {t.ch.title}
          </h2>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{t.ch.desc}</p>
        </div>

        <ChannelForm
          action={createChannelAction}
          lang={lang}
          inputLabel={t.ch.inputLabel}
          inputPh={t.ch.inputPh}
          add={t.ch.add}
          requiredMsg={t.required}
        />

        {channels.length > 0 && (
          <ul className="mt-5 space-y-2">
            {channels.map((ch: MediaChannel) => (
              <li
                key={ch.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                {ch.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={ch.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700" />
                ) : (
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-sm font-bold text-white">
                    {(ch.title?.[0] ?? "Y").toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{ch.title}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${ch.published ? "bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60" : "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700"}`}>
                      {ch.published ? t.shown : t.hidden}
                    </span>
                    {ch.featured && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60">
                        {t.featured}
                      </span>
                    )}
                  </div>
                  <a href={ch.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-zinc-400 underline-offset-2 hover:underline">
                    {ch.handle ? `@${ch.handle}` : ch.url} · {t.ch.autoNote}
                  </a>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <form action={toggleChannelFlagAction}>
                    <input type="hidden" name="id" value={ch.id} />
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="flag" value="published" />
                    <input type="hidden" name="value" value={ch.published ? "0" : "1"} />
                    <button type="submit" className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                      {ch.published ? t.hide : t.show}
                    </button>
                  </form>
                  <form action={toggleChannelFlagAction}>
                    <input type="hidden" name="id" value={ch.id} />
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="flag" value="featured" />
                    <input type="hidden" name="value" value={ch.featured ? "0" : "1"} />
                    <button type="submit" className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                      {ch.featured ? t.unfeature : t.feature}
                    </button>
                  </form>
                  <form action={deleteChannelAction}>
                    <input type="hidden" name="id" value={ch.id} />
                    <input type="hidden" name="lang" value={lang} />
                    <button type="submit" className="rounded-full px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" aria-label={t.ch.del}>
                      {t.ch.del}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 개별 콘텐츠 — 좌목록/우상세 */}
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
                const thumb = resolveThumbnail(item);
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
                        {thumb ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={thumb} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                            {t.noPreview}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active ? "bg-white/15 text-white dark:bg-zinc-900/10 dark:text-zinc-900" : TYPE_BADGE[item.type]}`}>
                            {TYPE_LABEL[item.type]}
                          </span>
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
            <MediaForm
              action={createMediaAction}
              lang={lang}
              f={t.f}
              create={t.create}
              save={t.save}
              del={t.del}
              requiredMsg={t.required}
            />
          ) : editing ? (
            <MediaForm
              action={updateMediaAction}
              deleteAction={deleteMediaAction}
              lang={lang}
              f={t.f}
              create={t.create}
              save={t.save}
              del={t.del}
              requiredMsg={t.required}
              item={{
                id: editing.id,
                type: editing.type,
                title: editing.title,
                url: editing.url,
                description: editing.description,
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
