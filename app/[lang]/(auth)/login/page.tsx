import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { company } from "@/lib/brand";
import { getSession } from "@/lib/auth";
import FloatingTokens from "@/components/FloatingTokens";
import CodeTyper from "@/components/CodeTyper";
import KakaoLoginButton from "@/components/auth/KakaoLoginButton";
import { getDictionary, hasLocale } from "../../dictionaries";
import { notFound } from "next/navigation";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.login.metaTitle} · ${company.nameKo}` };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { login } = dict;

  const session = await getSession();
  if (session) redirect(`/${lang}`);

  const sp = await searchParams;
  const returnTo = sp.returnTo ?? `/${lang}`;
  const error = sp.error;

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-indigo-50/40 px-4 pt-24 pb-12 dark:from-black dark:via-zinc-950 dark:to-indigo-950/30">
      <div className="bg-mesh absolute inset-0 opacity-70" aria-hidden />
      <div className="bg-grid absolute inset-0 opacity-50" aria-hidden />
      <div className="bg-noise" aria-hidden />
      <FloatingTokens density="normal" mask="fade" lang={lang} />
      <CodeTyper position="topLeft" startIdx={0} />
      <CodeTyper position="bottomRight" startIdx={2} />
      <div aria-hidden className="anim-float pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/30 to-fuchsia-400/20 blur-3xl dark:from-indigo-500/20 dark:to-fuchsia-500/15" />
      <div aria-hidden className="anim-float pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-400/20 blur-3xl dark:from-violet-500/15 dark:to-indigo-500/10" style={{ animationDelay: "-3s" }} />

      <div className="relative w-full max-w-md">
        <div className="relative rounded-3xl border border-white/40 bg-white/65 p-8 shadow-[0_30px_80px_-20px_rgba(99,102,241,0.25)] backdrop-blur-2xl ring-1 ring-white/30 sm:p-10 dark:border-white/5 dark:bg-zinc-900/55 dark:ring-white/5">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-base font-bold text-white shadow-lg shadow-indigo-500/25">
              CL
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {lang === "en" ? company.nameEn : company.nameKo}{login.heading}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              {login.subheading}
            </p>
          </div>

          {error && (
            <p className="mt-6 rounded-xl bg-rose-50/80 px-4 py-3 text-center text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
              {login.errorMsg} ({error})
            </p>
          )}

          <div className="mt-8 space-y-3">
            <KakaoLoginButton returnTo={returnTo} />
            <button type="button" disabled title="준비 중" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white text-sm font-medium text-zinc-400 opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#03C75A] text-[10px] font-bold text-white">N</span>
              {login.naverLabel}
            </button>
            <button type="button" disabled title="준비 중" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white text-sm font-medium text-zinc-400 opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
              <GoogleIcon className="h-5 w-5" />
              {login.googleLabel}
            </button>
            <button type="button" disabled title="준비 중" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white text-sm font-medium text-zinc-400 opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#0866FF] text-[10px] font-bold text-white">f</span>
              {login.metaLabel}
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {login.termsPrefix}
            <Link href={`/${lang}/contact`} className="font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300">
              {login.termsLink}
            </Link>
            {login.termsSuffix}
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 8 3l5.7-5.7C33.6 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.3-.3-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 8 3l5.7-5.7C33.6 6.1 29 4 24 4 16.1 4 9.3 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5 0 9.5-1.9 12.9-5l-6-5c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9 39.6 15.9 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6 5C40.9 35.5 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
