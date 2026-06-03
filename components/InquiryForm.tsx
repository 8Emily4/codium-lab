"use client";

import { useState } from "react";
import { useForm, type SubmitHandler, type UseFormRegister, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type FormDict = Dictionary["contact"]["form"];

function makeSchema(d: FormDict) {
  return z.object({
    name: z.string().min(1, d.nameRequired).max(60, d.nameMax),
    organization: z.string().max(80, d.orgMax).optional().or(z.literal("")),
    email: z.string().min(1, d.emailRequired).email(d.emailInvalid),
    phone: z.string().regex(/^[\d\s\-+()]*$/u, d.phoneInvalid).optional().or(z.literal("")),
    message: z.string().min(10, d.messageMin).max(2000, d.messageMax),
  });
}

type InquiryValues = {
  name: string;
  organization?: string;
  email: string;
  phone?: string;
  message: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function InquiryForm({ dict }: { dict: FormDict }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const schema = makeSchema(dict);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { name: "", organization: "", email: "", phone: "", message: "" },
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
        throw new Error(body.error || "Failed to send.");
      }
      setStatus({ kind: "success" });
      reset();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(99,102,241,0.25)] sm:p-9 dark:border-zinc-800/80 dark:bg-zinc-950"
    >
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-400/20 to-fuchsia-400/10 blur-3xl" />

      <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={dict.nameLabel} name="name" required register={register} error={errors.name} placeholder={dict.namePlaceholder} />
        <Field label={dict.orgLabel} name="organization" register={register} error={errors.organization} placeholder={dict.orgPlaceholder} />
        <Field label={dict.emailLabel} name="email" type="email" required register={register} error={errors.email} placeholder="you@company.com" />
        <Field label={dict.phoneLabel} name="phone" type="tel" register={register} error={errors.phone} placeholder={dict.phonePlaceholder} />
        <div className="sm:col-span-2">
          <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {dict.messageLabel} <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="message"
            rows={6}
            placeholder={dict.messagePlaceholder}
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
            <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.message.message}</p>
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
            {isSubmitting ? dict.submittingLabel : dict.submitLabel}
          </span>
          {!isSubmitting && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="relative z-10 transition group-hover:translate-x-0.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          )}
          <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
        </button>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{dict.privacyNote}</p>
        {status.kind === "success" && (
          <p className="w-full rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:w-auto dark:bg-emerald-500/10 dark:text-emerald-300">
            {dict.successMsg}
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
  label, name, type = "text", required = false, placeholder, register, error,
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
      <label htmlFor={name} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
      {error && <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{error.message}</p>}
    </div>
  );
}
