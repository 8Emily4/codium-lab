"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FloatingTokens from "@/components/FloatingTokens";
import type { SessionUser } from "@/lib/auth";

const STEPS = [
  { label: "세션 발급", code: "auth.session.issue()" },
  { label: "프로필 동기화", code: "profile.sync(provider)" },
  { label: "환경 준비", code: "workspace.warmup()" },
  { label: "준비 완료", code: "redirect → home" },
] as const;

export default function LoginTransition({
  user,
  returnTo,
}: {
  user: SessionUser;
  returnTo: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length) {
      const t = setTimeout(() => router.replace(returnTo), 380);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 520);
    return () => clearTimeout(t);
  }, [step, router, returnTo]);

  const progress = Math.min(1, (step + 1) / (STEPS.length + 1));

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-indigo-50/40 px-4 pt-24 pb-12 dark:from-black dark:via-zinc-950 dark:to-indigo-950/30">
      <div className="bg-mesh absolute inset-0 opacity-80" aria-hidden />
      <div className="bg-grid absolute inset-0 opacity-50" aria-hidden />
      <div className="bg-noise" aria-hidden />
      <FloatingTokens density="normal" mask="fade" />

      <div className="relative w-full max-w-md text-center">
        <div className="mx-auto rounded-3xl border border-white/40 bg-white/70 p-8 shadow-[0_30px_80px_-20px_rgba(99,102,241,0.25)] backdrop-blur-2xl ring-1 ring-white/30 sm:p-10 dark:border-white/5 dark:bg-zinc-900/60 dark:ring-white/5">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-base font-bold text-white shadow-lg shadow-indigo-500/25">
            CL
          </div>
          <p className="mt-5 text-xs font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-300">
            Welcome
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {user.name}님, 환영합니다
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            워크스페이스를 준비하고 있습니다…
          </p>

          {/* Progress bar */}
          <div className="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Step list */}
          <ul className="mt-6 space-y-2 text-left">
            {STEPS.map((s, i) => {
              const state = i < step ? "done" : i === step ? "active" : "pending";
              return (
                <li
                  key={s.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/70 bg-white/60 px-3.5 py-2.5 text-xs dark:border-zinc-800/70 dark:bg-zinc-900/40"
                >
                  <span className="flex items-center gap-2">
                    {state === "done" ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-emerald-500"
                        aria-hidden
                      >
                        <path d="M5 12l5 5 9-11" />
                      </svg>
                    ) : state === "active" ? (
                      <span
                        aria-hidden
                        className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-300"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="inline-block h-3.5 w-3.5 rounded-full border border-zinc-300 dark:border-zinc-600"
                      />
                    )}
                    <span
                      className={`font-medium ${
                        state === "pending"
                          ? "text-zinc-400 dark:text-zinc-500"
                          : "text-zinc-800 dark:text-zinc-100"
                      }`}
                    >
                      {s.label}
                    </span>
                  </span>
                  <code
                    className={`font-mono text-[10px] ${
                      state === "pending"
                        ? "text-zinc-300 dark:text-zinc-600"
                        : "text-indigo-500/80 dark:text-indigo-300/70"
                    }`}
                  >
                    {s.code}
                  </code>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          잠시만 기다려주세요. 자동으로 이동합니다.
        </p>
      </div>
    </div>
  );
}
