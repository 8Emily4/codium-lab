import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginTransition from "@/components/auth/LoginTransition";
import { getDictionary, hasLocale } from "../../../dictionaries";
export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.login.loginLoadingTitle };
}

export default async function LoginLoadingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { lang } = await params;
  const session = await getSession();
  if (!session) redirect(`/${lang}/login`);

  const sp = await searchParams;
  const returnTo = sp.returnTo ?? `/${lang}`;

  return <LoginTransition user={session} returnTo={returnTo} lang={lang} />;
}
