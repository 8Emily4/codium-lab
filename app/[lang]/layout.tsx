import { notFound } from "next/navigation";
import { hasLocale } from "./dictionaries";
export function generateStaticParams() {
  return [{ lang: "ko" }, { lang: "en" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <>{children}</>;
}
