import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import GalleryView, { type GalleryCard } from "@/components/gallery/GalleryView";
import { listPublishedGallery } from "@/lib/gallery";
import { parseYouTubeId, youTubeEmbedUrl, youTubeThumbnail } from "@/lib/media";
import { getDictionary, hasLocale } from "../../dictionaries";

// 관리자가 등록한 최신 내용을 항상 반영합니다.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.gallery.metaTitle,
    description: dict.gallery.metaDesc,
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const g = dict.gallery;

  const items = await listPublishedGallery();

  const cards: GalleryCard[] = items.map((item) => {
    if (item.kind === "video") {
      const ytId = item.videoUrl ? parseYouTubeId(item.videoUrl) : null;
      return {
        id: item.id,
        kind: "video",
        title: item.title,
        description: item.description,
        src: ytId ? youTubeThumbnail(ytId) : null,
        embedUrl: ytId ? youTubeEmbedUrl(ytId) : null,
        width: null,
        height: null,
        featured: item.featured,
      };
    }
    return {
      id: item.id,
      kind: "image",
      title: item.title,
      description: item.description,
      src: `/api/gallery/${item.id}?v=${item.updatedAt}`,
      embedUrl: null,
      width: item.width,
      height: item.height,
      featured: item.featured,
    };
  });

  return (
    <>
      <PageHeader
        eyebrow={g.eyebrow}
        title={g.heading}
        highlight={g.highlight}
        description={g.desc}
      />
      <GalleryView
        items={cards}
        strings={{
          imageLabel: g.imageLabel,
          videoLabel: g.videoLabel,
          featuredLabel: g.featuredLabel,
          watchLabel: g.watchLabel,
          empty: g.empty,
        }}
      />
    </>
  );
}
