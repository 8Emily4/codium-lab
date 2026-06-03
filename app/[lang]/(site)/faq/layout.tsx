import type { Metadata } from "next";
import { getDictionary, hasLocale } from "../../dictionaries";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.faq.metaTitle,
    description: dict.faq.metaDesc,
    alternates: { canonical: `/${lang}/faq` },
    openGraph: { title: dict.faq.metaTitle, description: dict.faq.metaDesc, url: `/${lang}/faq` },
  };
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
