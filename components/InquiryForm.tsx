"use client";

import { useState } from "react";
import { useForm, type SubmitHandler, type UseFormRegister, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/cn";

const InquirySchema = z.object({
  name: z
    .string()
    .min(1, "이름을 입력해 주세요.")
    .max(60, "이름은 60자 이하로 입력해 주세요."),
  organization: z
    .string()
    .max(80, "소속은 80자 이하로 입력해 주세요.")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .min(1, "이메일을 입력해 주세요.")
    .email("올바른 이메일 형식이 아닙니다."),
  phone: z
    .string()
    .regex(/^[\d\s\-+()]*$/u, "전화번호 형식이 올바르지 않습니다.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .min(10, "문의 내용은 최소 10자 이상 입력해 주세요.")
    .max(2000, "문의 내용은 2000자 이하로 입력해 주세요."),
});

type InquiryValues = z.infer<typeof InquirySchema>;

type Status =
  | { kind: "idle" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function InquiryForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryValues>({
    resolver: zodResolver(InquirySchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      organization: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit: SubmitHandler<InquiryValues> = async (values) => {
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "전송에 실패했습니다.");
      }
      setStatus({ kind: "success" });
      reset();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "알 수 없는 오류",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(99,102,241,0.25)] sm:p-9 dark:border-zinc-800/80 dark:bg-zinc-950"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-400/20 to-fuchsia-400/10 blur-3xl"
      />

      <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="이름"
          name="name"
          required
          register={register}
          error={errors.name}
          placeholder="홍길동"
        />
        <Field
          label="소속"
          name="organization"
          register={register}
          error={errors.organization}
          placeholder="회사·팀 (선택)"
        />
        <Field
          label="이메일"
          name="email"
          type="email"
          required
          register={register}
          error={errors.email}
          placeholder="you@company.com"
        />
        <Field
          label="연락처"
          name="phone"
          type="tel"
          register={register}
          error={errors.phone}
          placeholder="010-0000-0000 (선택)"
        />
        <div className="sm:col-span-2">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            문의 내용 <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="message"
            rows={6}
            placeholder="해결하고 싶은 문제, 기대하는 결과, 시점 등을 편하게 알려 주세요."
            aria-invalid={errors.message ? "true" : "false"}
            {...register("message")}
            className={cn(
              "mt-2 block w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500",
              errors.message
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-500/70"
                : "border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500/30 dark:border-zinc-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/30",
            )}
          />
          {errors.message && (
            <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
              {errors.message.message}
            </p>
          )}
        </div>
      </div>

      <div className="relative mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-zinc-900 px-7 text-sm font-medium text-white shadow-[0_12px_30px_-12px_rgba(79,70,229,0.6)] transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <span className="relative z-10">
            {isSubmitting ? "전송 중…" : "문의 보내기"}
          </span>
          {!isSubmitting && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="relative z-10 transition group-hover:translate-x-0.5"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          )}
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
          />
        </button>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          접수 즉시 SQLite 호환 DB에 적재되며, 외부로 공유되지 않습니다.
        </p>
        {status.kind === "success" && (
          <p className="w-full rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:w-auto dark:bg-emerald-500/10 dark:text-emerald-300">
            문의가 접수되었습니다. 곧 회신드리겠습니다.
          </p>
        )}
        {status.kind === "error" && (
          <p className="w-full rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:w-auto dark:bg-rose-500/10 dark:text-rose-300">
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  register,
  error,
}: {
  label: string;
  name: keyof InquiryValues;
  type?: string;
  required?: boolean;
  placeholder?: string;
  register: UseFormRegister<InquiryValues>;
  error?: FieldError;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
        {...register(name)}
        className={cn(
          "mt-2 block w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500",
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-500/70"
            : "border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500/30 dark:border-zinc-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/30",
        )}
      />
      {error && (
        <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
          {error.message}
        </p>
      )}
    </div>
  );
}
