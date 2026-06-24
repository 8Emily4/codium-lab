import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import { requireAdmin } from "@/lib/users";
import { parseYouTubeId, youTubeThumbnail } from "@/lib/media";
import { listAllGallery, type GalleryItem } from "@/lib/gallery";
import { Card, EmptyState, WorkHeader, formatDateTime } from "@/components/work/ui";
import GalleryForm from "./GalleryForm";
import {
  createGalleryAction,
  deleteGalleryAction,
  toggleGalleryFlagAction,
  updateGalleryAction,
} from "./actions";

export const dynamic = "force-dynamic";

type Strings = {
  eyebrow: string;
  title: string;
  desc: string;
  viewPage: string;
  newTitle: string;
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
  badgeImage: string;
  badgeVideo: string;
  replaceHint: string;
  f: import("./GalleryForm").GalleryFormStrings;
};

const T: Record<"ko" | "en", Strings> = {
  ko: {
    eyebrow: "관리",
    title: "갤러리 관리",
    desc: "재미있는 이미지를 업로드하거나 영상(YouTube) 링크를 등록하면 갤러리 페이지에서 모든 방문자가 볼 수 있습니다.",
    viewPage: "갤러리 페이지 보기",
    newTitle: "새 항목 등록",
    listTitle: "등록된 항목",
    empty: "아직 등록된 항목이 없습니다.",
    noPreview: "미리보기 없음",
    edit: "수정 / 삭제",
    save: "저장",
    del: "이 항목 삭제",
    hide: "숨기기",
    show: "노출",
    feature: "추천",
    unfeature: "추천 해제",
    shown: "노출 중",
    hidden: "숨김",
    featured: "추천",
    badgeImage: "이미지",
    badgeVideo: "영상",
    replaceHint: "(비워두면 기존 이미지 유지)",
    f: {
      kind: "종류",
      kindImage: "이미지 업로드",
      kindVideo: "영상 링크",
      title: "제목 *",
      titlePh: "예: 개발자 남편과 컴공 주부의 동업기",
      image: "이미지 파일 *",
      imageHint: "(jpg/png/webp 등, 업로드 시 자동 최적화)",
      videoUrl: "YouTube URL *",
      videoUrlPh: "https://youtube.com/watch?v=... 또는 youtu.be/...",
      desc: "설명",
      descPh: "한두 줄 소개 (선택)",
      publish: "페이지에 노출",
      feature: "추천으로 상단 고정",
      create: "등록하기",
      requiredTitle: "제목을 입력해 주세요",
      requiredImage: "이미지 파일을 선택해 주세요",
      requiredVideo: "영상 URL을 입력해 주세요",
    },
  },
  en: {
    eyebrow: "Manage",
    title: "Gallery",
    desc: "Upload fun images or register video (YouTube) links — every visitor can view them on the gallery page.",
    viewPage: "View gallery page",
    newTitle: "Add item",
    listTitle: "Items",
    empty: "No items yet.",
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
    badgeImage: "Image",
    badgeVideo: "Video",
    replaceHint: "(leave empty to keep the current image)",
    f: {
      kind: "Type",
      kindImage: "Upload image",
      kindVideo: "Video link",
      title: "Title *",
      titlePh: "e.g. Our startup story",
      image: "Image file *",
      imageHint: "(jpg/png/webp, auto-optimized on upload)",
      videoUrl: "YouTube URL *",
      videoUrlPh: "https://youtube.com/watch?v=... or youtu.be/...",
      desc: "Description",
      descPh: "A line or two (optional)",
      publish: "Show on page",
      feature: "Pin as featured",
      create: "Add",
      requiredTitle: "Title is required",
      requiredImage: "Please choose an image file",
      requiredVideo: "Please enter a video URL",
    },
  },
};

const INPUT =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";
const LABEL =
  "mb-1.5 block text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-300";

/** 항목 미리보기 썸네일 URL (이미지는 API 라우트, 영상은 YouTube 썸네일). */
function previewUrl(item: GalleryItem): string | null {
  if (item.kind === "image") return `/api/gallery/${item.id}?v=${item.updatedAt}`;
  const id = item.videoUrl ? parseYouTubeId(item.videoUrl) : null;
  return id ? youTubeThumbnail(id) : null;
}

function EditFields({ t, item }: { t: Strings; item: GalleryItem }) {
  const f = t.f;
  return (
    <>
      <input type="hidden" name="kind" value={item.kind} />
      <div>
        <label className={LABEL}>{f.title}</label>
        <input name="title" required defaultValue={item.title} placeholder={f.titlePh} className={INPUT} />
      </div>

      {item.kind === "image" ? (
        <div>
          <label className={LABEL}>
            {f.image.replace(" *", "")}{" "}
            <span className="font-normal text-zinc-400">{t.replaceHint}</span>
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:text-zinc-300 dark:file:bg-white dark:file:text-zinc-900"
          />
        </div>
      ) : (
        <div>
          <label className={LABEL}>{f.videoUrl}</label>
          <input name="videoUrl" type="url" required defaultValue={item.videoUrl ?? ""} placeholder={f.videoUrlPh} className={INPUT} />
        </div>
      )}

      <div>
        <label className={LABEL}>{f.desc}</label>
        <textarea name="description" rows={2} defaultValue={item.description ?? ""} placeholder={f.descPh} className={`${INPUT} resize-y`} />
      </div>

      <div className="flex flex-wrap items-center gap-5 pt-1">
        <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input type="checkbox" name="published" defaultChecked={item.published} className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600" />
          {f.publish}
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input type="checkbox" name="featured" defaultChecked={item.featured} className="h-4 w-4 rounded border-zinc-300 text-fuchsia-600 focus:ring-fuchsia-500 dark:border-zinc-600" />
          {f.feature}
        </label>
      </div>
    </>
  );
}

export default async function WorkGalleryAdmin({
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

  const items = await listAllGallery();

  return (
    <>
      <WorkHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.desc}
        action={
          <Link
            href={`/${lang}/gallery`}
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
        <GalleryForm action={createGalleryAction} lang={lang} f={t.f} />
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
            const thumb = previewUrl(item);
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
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${item.kind === "video" ? "bg-red-50 text-red-600 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/60" : "bg-indigo-50 text-indigo-600 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60"}`}>
                          {item.kind === "video" ? t.badgeVideo : t.badgeImage}
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
                      {item.description && (
                        <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{item.description}</p>
                      )}
                      <p className="mt-0.5 text-[11px] text-zinc-400">{formatDateTime(item.createdAt, lang)}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <form action={toggleGalleryFlagAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="lang" value={lang} />
                        <input type="hidden" name="flag" value="published" />
                        <input type="hidden" name="value" value={item.published ? "0" : "1"} />
                        <button type="submit" className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                          {item.published ? t.hide : t.show}
                        </button>
                      </form>
                      <form action={toggleGalleryFlagAction}>
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
                      <form action={updateGalleryAction} className="space-y-4">
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="lang" value={lang} />
                        <EditFields t={t} item={item} />
                        <div className="pt-1">
                          <button type="submit" className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500">
                            {t.save}
                          </button>
                        </div>
                      </form>
                      <form action={deleteGalleryAction}>
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
