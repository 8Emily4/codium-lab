import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { company } from "@/lib/brand";
import { getSessionWithRole } from "@/lib/users";
import { hasLocale } from "../../../dictionaries";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};

const T = {
  ko: {
    heading: "관리자 로그인",
    subheading: "이메일과 비밀번호로 로그인하세요",
    email: "이메일",
    password: "비밀번호",
    submit: "로그인",
    error: "이메일 또는 비밀번호가 올바르지 않습니다.",
    back: "← 일반 로그인으로",
  },
  en: {
    heading: "Admin login",
    subheading: "Sign in with your email and password",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    error: "Invalid email or password.",
    back: "← Back to social login",
  },
} as const;

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = T[lang === "en" ? "en" : "ko"];

  // Already a super admin? Skip straight to the workspace.
  const ctx = await getSessionWithRole();
  const sp = await searchParams;
  const returnTo = sp.returnTo ?? `/${lang}/work`;
  if (ctx?.role === "superAdmin") redirect(returnTo);

  const showError = sp.error === "invalid";

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-indigo-50/40 px-4 pt-24 pb-12 dark:from-black dark:via-zinc-950 dark:to-indigo-950/30">
      <div className="bg-mesh absolute inset-0 opacity-70" aria-hidden />
      <div className="bg-grid absolute inset-0 opacity-50" aria-hidden />
      <div className="bg-noise" aria-hidden />

      <div className="relative w-full max-w-md">
        <div className="relative rounded-3xl border border-white/40 bg-white/65 p-8 shadow-[0_30px_80px_-20px_rgba(99,102,241,0.25)] backdrop-blur-2xl ring-1 ring-white/30 sm:p-10 dark:border-white/5 dark:bg-zinc-900/55 dark:ring-white/5">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-base font-bold text-white shadow-lg dark:from-zinc-700 dark:to-zinc-900">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {t.heading}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              {company.nameKo} · {t.subheading}
            </p>
          </div>

          {showError && (
            <p className="mt-6 rounded-xl bg-rose-50/80 px-4 py-3 text-center text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
              {t.error}
            </p>
          )}

          <AdminLoginForm
            lang={lang}
            returnTo={returnTo}
            t={{ email: t.email, password: t.password, submit: t.submit }}
          />

          <p className="mt-6 text-center">
            <Link
              href={`/${lang}/login`}
              className="text-xs text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {t.back}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
