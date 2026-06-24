import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import { requireAdmin } from "@/lib/users";
import {
  listAllChannels,
  listAllMedia,
  resolveThumbnail,
  type MediaChannel,
  type MediaContent,
  type MediaType,
} from "@/lib/media";
import { Card, EmptyState, WorkHeader, formatDateTime } from "@/components/work/ui";
import {
  createChannelAction,
  createMediaAction,
  deleteChannelAction,
  deleteMediaAction,
  toggleChannelFlagAction,
  toggleMediaFlagAction,
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

const INPUT =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";
const LABEL =
  "mb-1.5 block text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-300";

function MediaFields({ t, item }: { t: Strings; item?: MediaContent }) {
  const f = t.f;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>{f.type}</label>
          <select name="type" defaultValue={item?.type ?? "youtube"} className={INPUT}>
            <option value="youtube">{f.typeYoutube}</option>
            <option value="instagram">{f.typeInstagram}</option>
            <option value="other">{f.typeOther}</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>{f.title}</label>
          <input name="title" required defaultValue={item?.title ?? ""} placeholder={f.titlePh} className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL}>{f.url}</label>
        <input name="url" required type="url" defaultValue={item?.url ?? ""} placeholder={f.urlPh} className={INPUT} />
      </div>

      <div>
        <label className={LABEL}>{f.desc}</label>
        <textarea name="description" rows={2} defaultValue={item?.description ?? ""} placeholder={f.descPh} className={`${INPUT} resize-y`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>
            {f.thumb} <span className="font-normal text-zinc-400">{f.thumbHint}</span>
          </label>
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

export default async function WorkContentAdmin({
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

  const [items, channels] = await Promise.all([
    listAllMedia(),
    listAllChannels(),
  ]);

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

        <form action={createChannelAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="lang" value={lang} />
          <div className="flex-1">
            <label className={LABEL}>{t.ch.inputLabel}</label>
            <input name="channel" required placeholder={t.ch.inputPh} className={INPUT} />
          </div>
          <button type="submit" className="inline-flex h-[42px] shrink-0 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
            {t.ch.add}
          </button>
        </form>

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

      {/* Create individual item */}
      <Card className="mb-8 p-6">
        <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          {t.newTitle}
        </h2>
        <form action={createMediaAction} className="space-y-4">
          <input type="hidden" name="lang" value={lang} />
          <MediaFields t={t} />
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
          {items.map((item) => {
            const thumb = resolveThumbnail(item);
            return (
              <li key={item.id}>
                <Card className="overflow-hidden">
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-20 sm:w-36 dark:bg-zinc-800">
                      {thumb ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={thumb} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                          {t.noPreview}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${TYPE_BADGE[item.type]}`}>
                          {TYPE_LABEL[item.type]}
                        </span>
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
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-zinc-400 underline-offset-2 hover:underline">
                        {item.url}
                      </a>
                      <p className="mt-0.5 text-[11px] text-zinc-400">{formatDateTime(item.createdAt, lang)}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <form action={toggleMediaFlagAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="lang" value={lang} />
                        <input type="hidden" name="flag" value="published" />
                        <input type="hidden" name="value" value={item.published ? "0" : "1"} />
                        <button type="submit" className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                          {item.published ? t.hide : t.show}
                        </button>
                      </form>
                      <form action={toggleMediaFlagAction}>
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
                      <form action={updateMediaAction} className="space-y-4">
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="lang" value={lang} />
                        <MediaFields t={t} item={item} />
                        <div className="pt-1">
                          <button type="submit" className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500">
                            {t.save}
                          </button>
                        </div>
                      </form>
                      <form action={deleteMediaAction}>
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
            );
          })}
        </ul>
      )}
    </>
  );
}
