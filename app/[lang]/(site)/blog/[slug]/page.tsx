import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/work/Markdown";
import { getPublishedPostBySlug } from "@/lib/blog";
import { formatDate } from "@/components/work/ui";
import { getDictionary, hasLocale } from "../../../dictionaries";

// Posts are edited live in the admin screen — always render fresh.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary ?? undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const b = dict.blog;

  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="relative">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black">
        <div className="bg-mesh absolute inset-0 opacity-90" aria-hidden />
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="bg-noise" aria-hidden />
        <div
          className="anim-float pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/30 to-fuchsia-400/20 blur-3xl dark:from-indigo-500/20 dark:to-fuchsia-500/10"
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <Link
            href={`/${lang}/blog`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m12 19-7-7 7-7M19 12H5" />
            </svg>
            {b.backToList}
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
            <span className="font-semibold tracking-[0.18em] text-indigo-600 uppercase dark:text-indigo-400">
              {b.eyebrow}
            </span>
            <span aria-hidden>·</span>
            <span>{formatDate(post.createdAt, lang)}</span>
            {post.authorName && (
              <>
                <span aria-hidden>·</span>
                <span>{post.authorName}</span>
              </>
            )}
          </div>

          <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            {post.title}
          </h1>

          {post.summary && (
            <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
              {post.summary}
            </p>
          )}

          {post.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {post.thumbnail && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={post.thumbnail}
            alt=""
            className="mb-10 w-full rounded-2xl border border-zinc-200 object-cover dark:border-zinc-800"
          />
        )}
        <Markdown>{post.body}</Markdown>

        <div className="mt-14 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <Link
            href={`/${lang}/blog`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:gap-2.5 dark:text-indigo-400"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m12 19-7-7 7-7M19 12H5" />
            </svg>
            {b.backToList}
          </Link>
        </div>
      </div>
    </article>
  );
}
