"use client";

import { useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type Labels = {
  email: string;
  password: string;
  submit: string;
};

const MSG = {
  ko: { required: "필수 입력 항목입니다.", email: "올바른 이메일 주소를 입력하세요." },
  en: { required: "This field is required.", email: "Enter a valid email address." },
} as const;

type Values = { email: string; password: string };

export default function AdminLoginForm({
  lang,
  returnTo,
  t,
}: {
  lang: string;
  returnTo: string;
  t: Labels;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const msg = lang === "en" ? MSG.en : MSG.ko;

  const schema = z.object({
    email: z.string().min(1, msg.required).email(msg.email),
    password: z.string().min(1, msg.required),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  // Validated -> native POST so the API can issue its 303 redirect.
  // formRef.submit() bypasses React's onSubmit, so there's no handler loop.
  const onValid: SubmitHandler<Values> = () => {
    formRef.current?.submit();
  };

  return (
    <form
      ref={formRef}
      action="/api/auth/admin/login"
      method="POST"
      noValidate
      onSubmit={handleSubmit(onValid)}
      className="mt-8 space-y-4"
    >
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {t.email}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          aria-invalid={errors.email ? "true" : "false"}
          {...register("email")}
          className="w-full rounded-xl border border-zinc-300 bg-white/80 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-50"
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {t.password}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? "true" : "false"}
          {...register("password")}
          className="w-full rounded-xl border border-zinc-300 bg-white/80 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-50"
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.password.message}</p>
        )}
      </div>
      <button
        type="submit"
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {t.submit}
      </button>
    </form>
  );
}
