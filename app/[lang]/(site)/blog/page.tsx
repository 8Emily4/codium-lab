import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import BlogList, { type BlogCard } from "@/components/blog/BlogList";
import { listPublishedPosts } from "@/lib/blog";
import { formatDate } from "@/components/work/ui";
import { getDictionary, hasLocale } from "../../dictionaries";

// Always reflect the latest posts published from the admin screen.
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
    title: dict.blog.metaTitle,
    description: dict.blog.metaDesc,
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const posts = await listPublishedPosts();
  const cards: BlogCard[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    thumb: p.thumbnail,
    tags: p.tags,
    featured: p.featured,
    date: formatDate(p.createdAt, lang),
  }));

  const b = dict.blog;

  return (
    <>
      <PageHeader
        eyebrow={b.eyebrow}
        title={b.heading}
        highlight={b.highlight}
        description={b.desc}
      />
      <BlogList
        items={cards}
        lang={lang}
        strings={{
          filterAll: b.filterAll,
          featuredLabel: b.featuredLabel,
          readMore: b.readMore,
          empty: b.empty,
        }}
      />
    </>
  );
}
