"use client";

import { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const INPUT =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";
const INPUT_ERROR =
  "w-full rounded-xl border border-rose-400 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500/70 dark:bg-zinc-950 dark:text-zinc-50";
const LABEL =
  "mb-1.5 block text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-300";

export default function ChannelForm({
  action,
  lang,
  inputLabel,
  inputPh,
  add,
  requiredMsg,
}: {
  action: (formData: FormData) => Promise<void>;
  lang: string;
  inputLabel: string;
  inputPh: string;
  add: string;
  requiredMsg: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const schema = z.object({
    channel: z.string().trim().min(1, requiredMsg),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ channel: string }>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { channel: "" },
  });

  const onValid = () => {
    const fd = new FormData(formRef.current!);
    startTransition(async () => {
      await action(fd);
      reset();
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onValid)}
      noValidate
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="lang" value={lang} />
      <div className="flex-1">
        <label className={LABEL}>{inputLabel}</label>
        <input
          {...register("channel")}
          placeholder={inputPh}
          aria-invalid={errors.channel ? "true" : "false"}
          className={errors.channel ? INPUT_ERROR : INPUT}
        />
        {errors.channel && (
          <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.channel.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-[42px] shrink-0 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {add}
      </button>
    </form>
  );
}
