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

const FORM_ID = "media-detail-form";

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

export type MediaEditItem = {
  id: number;
  type: "youtube" | "instagram" | "other";
  title: string;
  url: string;
  description: string | null;
  thumbnail: string | null;
  tags: string[];
  published: boolean;
  featured: boolean;
};

export default function MediaForm({
  action,
  deleteAction,
  lang,
  f,
  create,
  save,
  del,
  requiredMsg,
  item,
}: {
  action: (formData: FormData) => Promise<void>;
  /** edit 모드에서만 전달 — 삭제 서버 액션. */
  deleteAction?: (formData: FormData) => Promise<void>;
  lang: string;
  f: MediaFormStrings;
  create: string;
  save: string;
  del: string;
  requiredMsg: string;
  /** edit 모드에서만 전달 — 기존 콘텐츠. */
  item?: MediaEditItem;
}) {
  const isEdit = !!item;
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
    defaultValues: { title: item?.title ?? "", url: item?.url ?? "" },
  });

  const onValid = () => {
    const form = formRef.current!;
    const fd = new FormData(form);
    startTransition(async () => {
      await action(fd);
      if (!isEdit) {
        reset();
        form.reset();
      }
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="p-4 sm:p-6">
        <form
          id={FORM_ID}
          ref={formRef}
          onSubmit={handleSubmit(onValid)}
          noValidate
          className="space-y-4"
        >
          <input type="hidden" name="lang" value={lang} />
          {item && <input type="hidden" name="id" value={item.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>{f.type}</label>
              <select
                name="type"
                defaultValue={item?.type ?? "youtube"}
                className={INPUT}
              >
                <option value="youtube">{f.typeYoutube}</option>
                <option value="instagram">{f.typeInstagram}</option>
                <option value="other">{f.typeOther}</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>{f.title}</label>
              <input
                {...register("title")}
                defaultValue={item?.title ?? ""}
                placeholder={f.titlePh}
                aria-invalid={errors.title ? "true" : "false"}
                className={errors.title ? INPUT_ERROR : INPUT}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className={LABEL}>{f.url}</label>
            <input
              {...register("url")}
              type="url"
              defaultValue={item?.url ?? ""}
              placeholder={f.urlPh}
              aria-invalid={errors.url ? "true" : "false"}
              className={errors.url ? INPUT_ERROR : INPUT}
            />
            {errors.url && (
              <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
                {errors.url.message}
              </p>
            )}
          </div>

          <div>
            <label className={LABEL}>{f.desc}</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={item?.description ?? ""}
              placeholder={f.descPh}
              className={`${INPUT} resize-y`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>
                {f.thumb}{" "}
                <span className="font-normal text-zinc-400">{f.thumbHint}</span>
              </label>
              <input
                name="thumbnail"
                type="url"
                defaultValue={item?.thumbnail ?? ""}
                placeholder={f.thumbPh}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>
                {f.tags}{" "}
                <span className="font-normal text-zinc-400">{f.tagsHint}</span>
              </label>
              <input
                name="tags"
                defaultValue={item?.tags.join(", ") ?? ""}
                placeholder={f.tagsPh}
                className={INPUT}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                name="published"
                defaultChecked={item ? item.published : true}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
              />
              {f.publish}
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={item?.featured ?? false}
                className="h-4 w-4 rounded border-zinc-300 text-fuchsia-600 focus:ring-fuchsia-500 dark:border-zinc-600"
              />
              {f.feature}
            </label>
          </div>
        </form>
      </div>

      {/* 하단 고정 액션바 — 삭제(좌) / 저장·등록(우) */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-b-2xl border-t border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/90">
        <div>
          {isEdit && deleteAction && item && (
            <form action={deleteAction}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="lang" value={lang} />
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                {del}
              </button>
            </form>
          )}
        </div>
        <button
          type="submit"
          form={FORM_ID}
          disabled={pending}
          className="inline-flex h-10 items-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isEdit ? save : create}
        </button>
      </div>
    </div>
  );
}
