import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import { requireAdmin } from "@/lib/users";
import { parseYouTubeId, youTubeThumbnail } from "@/lib/media";
import { listAllGallery, type GalleryItem } from "@/lib/gallery";
import { EmptyState, WorkHeader } from "@/components/work/ui";
import GalleryForm from "./GalleryForm";
import {
  createGalleryAction,
  deleteGalleryAction,
  updateGalleryAction,
} from "./actions";

export const dynamic = "force-dynamic";

type Strings = {
  eyebrow: string;
  title: string;
  desc: string;
  viewPage: string;
  newTitle: string;
  newBtn: string;
  pick: string;
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
    newBtn: "+ 새 항목",
    pick: "항목을 선택하거나 새로 등록하세요.",
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
      save: "저장",
      del: "삭제",
      replaceHint: "(비워두면 기존 이미지 유지)",
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
    newBtn: "+ New",
    pick: "Select an item or add a new one.",
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
      save: "Save",
      del: "Delete",
      replaceHint: "(leave empty to keep the current image)",
      requiredTitle: "Title is required",
      requiredImage: "Please choose an image file",
      requiredVideo: "Please enter a video URL",
    },
  },
};

/** 항목 미리보기 썸네일 URL (이미지는 API 라우트, 영상은 YouTube 썸네일). */
function previewUrl(item: GalleryItem): string | null {
  if (item.kind === "image") return `/api/gallery/${item.id}?v=${item.updatedAt}`;
  const id = item.videoUrl ? parseYouTubeId(item.videoUrl) : null;
  return id ? youTubeThumbnail(id) : null;
}

export default async function WorkGalleryAdmin({
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

  const base = `/${lang}/work/admin/gallery`;
  const items = await listAllGallery();

  const isNew = id === "new";
  const editing = !isNew && id ? items.find((i) => String(i.id) === id) : null;

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
              {t.newBtn}
            </Link>
          </div>

          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 px-3 py-6 text-center text-xs text-zinc-400 dark:border-zinc-700">
              {t.pick}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((item) => {
                const thumb = previewUrl(item);
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
                          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active ? "bg-white/15 text-white dark:bg-zinc-900/10 dark:text-zinc-900" : item.kind === "video" ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"}`}>
                            {item.kind === "video" ? t.badgeVideo : t.badgeImage}
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
            <GalleryForm key="new" action={createGalleryAction} lang={lang} f={t.f} />
          ) : editing ? (
            <GalleryForm
              key={editing.id}
              action={updateGalleryAction}
              deleteAction={deleteGalleryAction}
              lang={lang}
              f={t.f}
              item={{
                id: editing.id,
                kind: editing.kind,
                title: editing.title,
                description: editing.description,
                videoUrl: editing.videoUrl,
                published: editing.published,
                featured: editing.featured,
              }}
            />
          ) : (
            <EmptyState title={t.pick} />
          )}
        </section>
      </div>
    </>
  );
}
