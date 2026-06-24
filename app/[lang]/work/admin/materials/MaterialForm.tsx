"use client";

import { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
const inputErrCls =
  "w-full rounded-lg border border-rose-400 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500/70 dark:bg-zinc-950 dark:text-zinc-100";
const labelCls =
  "mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400";

type Dict = {
  fTitle: string;
  fSummary: string;
  fCategory: string;
  fTags: string;
  fStatus: string;
  fAccess: string;
  fBody: string;
  accessPublic: string;
  accessRestricted: string;
  save: string;
  create: string;
  statusDraft: string;
  statusPublished: string;
  statusArchived: string;
  required: string;
};

type MaterialData = {
  id: string;
  title: string;
  summary: string | null;
  category: string | null;
  tags: string[];
  status: string;
  access: string;
  body: string;
};

export default function MaterialForm({
  action,
  lang,
  t,
  mode,
  material,
}: {
  action: (formData: FormData) => void | Promise<void>;
  lang: string;
  t: Dict;
  mode: "create" | "edit";
  material?: MaterialData;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const schema = z.object({
    title: z.string().min(1, t.required),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ title: string }>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { title: material?.title ?? "" },
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
      className="space-y-4"
    >
      <input type="hidden" name="lang" value={lang} />
      {material && <input type="hidden" name="id" value={material.id} />}

      <div>
        <label className={labelCls}>{t.fTitle}</label>
        <input
          {...register("title")}
          defaultValue={material?.title ?? ""}
          aria-invalid={errors.title ? "true" : "false"}
          className={errors.title ? inputErrCls : inputCls}
          placeholder={t.fTitle}
        />
        {errors.title && (
          <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className={labelCls}>{t.fSummary}</label>
        <input
          name="summary"
          defaultValue={material?.summary ?? ""}
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{t.fCategory}</label>
          <input
            name="category"
            defaultValue={material?.category ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>{t.fTags}</label>
          <input
            name="tags"
            defaultValue={material?.tags.join(", ") ?? ""}
            className={inputCls}
            placeholder="React, Next.js"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{t.fStatus}</label>
          <select
            name="status"
            defaultValue={material?.status ?? "draft"}
            className={inputCls}
          >
            <option value="draft">{t.statusDraft}</option>
            <option value="published">{t.statusPublished}</option>
            <option value="archived">{t.statusArchived}</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{t.fAccess}</label>
          <select
            name="access"
            defaultValue={material?.access ?? "restricted"}
            className={inputCls}
          >
            <option value="restricted">{t.accessRestricted}</option>
            <option value="public">{t.accessPublic}</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>{t.fBody}</label>
        <textarea
          name="body"
          defaultValue={material?.body ?? ""}
          rows={16}
          className={`${inputCls} resize-y font-mono text-[13px] leading-6`}
          placeholder={
            lang === "en"
              ? "# Title\n\nWrite your content in markdown."
              : "# 제목\n\n내용을 마크다운으로 작성하세요."
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mode === "create" ? t.create : t.save}
        </button>
      </div>
    </form>
  );
}
