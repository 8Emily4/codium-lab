import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { getDictionary, hasLocale } from "../../dictionaries";
import { notFound } from "next/navigation";
import FaqContent from "./FaqContent";

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { faq } = dict;

  return (
    <>
      <PageHeader
        eyebrow={faq.eyebrow}
        title={faq.title}
        highlight={faq.titleHighlight}
        description={faq.desc}
        cta={
          <Link
            href={`/${lang}/contact`}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {faq.ctaLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        }
      />
      <FaqContent faq={faq} />
    </>
  );
}
