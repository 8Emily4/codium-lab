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

export type MediaFormStrings = {
  type: string;
  typeYoutube: string;
  typeInstagram: string;
  typeOther: string;
  title: string;
  titlePh: string;
  url: string;
  urlPh: string;
  desc: string;
  descPh: string;
  thumb: string;
  thumbHint: string;
  thumbPh: string;
  tags: string;
  tagsHint: string;
  tagsPh: string;
  publish: string;
  feature: string;
};

export default function MediaForm({
  action,
  lang,
  f,
  create,
  requiredMsg,
}: {
  action: (formData: FormData) => Promise<void>;
  lang: string;
  f: MediaFormStrings;
  create: string;
  requiredMsg: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const schema = z.object({
    title: z.string().trim().min(1, requiredMsg),
    url: z.string().trim().min(1, requiredMsg),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ title: string; url: string }>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { title: "", url: "" },
  });

  const onValid = () => {
    const fd = new FormData(formRef.current!);
    startTransition(async () => {
      await action(fd);
      reset();
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onValid)} noValidate className="space-y-4">
      <input type="hidden" name="lang" value={lang} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>{f.type}</label>
          <select name="type" defaultValue="youtube" className={INPUT}>
            <option value="youtube">{f.typeYoutube}</option>
            <option value="instagram">{f.typeInstagram}</option>
            <option value="other">{f.typeOther}</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>{f.title}</label>
          <input
            {...register("title")}
            placeholder={f.titlePh}
            aria-invalid={errors.title ? "true" : "false"}
            className={errors.title ? INPUT_ERROR : INPUT}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.title.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className={LABEL}>{f.url}</label>
        <input
          {...register("url")}
          type="url"
          placeholder={f.urlPh}
          aria-invalid={errors.url ? "true" : "false"}
          className={errors.url ? INPUT_ERROR : INPUT}
        />
        {errors.url && (
          <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.url.message}</p>
        )}
      </div>

      <div>
        <label className={LABEL}>{f.desc}</label>
        <textarea name="description" rows={2} placeholder={f.descPh} className={`${INPUT} resize-y`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>
            {f.thumb} <span className="font-normal text-zinc-400">{f.thumbHint}</span>
          </label>
          <input name="thumbnail" type="url" placeholder={f.thumbPh} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>
            {f.tags} <span className="font-normal text-zinc-400">{f.tagsHint}</span>
          </label>
          <input name="tags" placeholder={f.tagsPh} className={INPUT} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 pt-1">
        <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input type="checkbox" name="published" defaultChecked className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600" />
          {f.publish}
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input type="checkbox" name="featured" className="h-4 w-4 rounded border-zinc-300 text-fuchsia-600 focus:ring-fuchsia-500 dark:border-zinc-600" />
          {f.feature}
        </label>
      </div>

      <div className="pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {create}
        </button>
      </div>
    </form>
  );
}
