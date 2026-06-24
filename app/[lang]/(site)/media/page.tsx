import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import MediaGallery, {
  type ChannelGroup,
  type MediaCard,
} from "@/components/media/MediaGallery";
import {
  fetchChannelVideos,
  listPublishedChannels,
  listPublishedMedia,
  parseYouTubeId,
  resolveThumbnail,
  youTubeEmbedUrl,
} from "@/lib/media";
import { getDictionary, hasLocale } from "../../dictionaries";

// Always reflect the latest content registered in the admin screen, plus the
// freshest channel uploads (RSS responses are themselves cached for 10 min).
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
    title: dict.media.metaTitle,
    description: dict.media.metaDesc,
  };
}

export default async function MediaPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const [channelRecords, items] = await Promise.all([
    listPublishedChannels(),
    listPublishedMedia(),
  ]);

  // Pull each channel's recent uploads (cached upstream), in parallel.
  const channels: ChannelGroup[] = (
    await Promise.all(
      channelRecords.map(async (ch) => {
        const { videos } = await fetchChannelVideos(ch.channelId, 9);
        const cards: MediaCard[] = videos.map((v) => ({
          id: `yt-${v.videoId}`,
          type: "youtube" as const,
          title: v.title,
          description: null,
          url: v.url,
          thumb: v.thumb,
          embedUrl: youTubeEmbedUrl(v.videoId),
          tags: [],
          featured: false,
        }));
        return {
          id: ch.id,
          title: ch.title,
          url: ch.url,
          avatar: ch.avatar,
          videos: cards,
        };
      }),
    )
  ).filter((c) => c.videos.length > 0);

  const itemCards: MediaCard[] = items.map((item) => {
    const ytId = item.type === "youtube" ? parseYouTubeId(item.url) : null;
    return {
      id: `m-${item.id}`,
      type: item.type,
      title: item.title,
      description: item.description,
      url: item.url,
      thumb: resolveThumbnail(item),
      embedUrl: ytId ? youTubeEmbedUrl(ytId) : null,
      tags: item.tags,
      featured: item.featured,
    };
  });

  const m = dict.media;

  return (
    <>
      <PageHeader
        eyebrow={m.eyebrow}
        title={m.heading}
        highlight={m.highlight}
        description={m.desc}
      />
      <MediaGallery
        channels={channels}
        items={itemCards}
        strings={{
          typeYoutube: m.typeYoutube,
          typeInstagram: m.typeInstagram,
          typeOther: m.typeOther,
          featuredLabel: m.featuredLabel,
          watchLabel: m.watchLabel,
          openLabel: m.openLabel,
          viewChannel: m.viewChannel,
          more: m.more,
          empty: m.empty,
        }}
      />
    </>
  );
}
