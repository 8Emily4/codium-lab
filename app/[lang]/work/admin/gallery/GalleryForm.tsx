"use client";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const INPUT =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";
const INPUT_ERROR =
  "w-full rounded-xl border border-rose-400 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500/70 dark:bg-zinc-950 dark:text-zinc-50";
const LABEL =
  "mb-1.5 block text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-300";

const FORM_ID = "gallery-detail-form";

export type GalleryFormStrings = {
  kind: string;
  kindImage: string;
  kindVideo: string;
  title: string;
  titlePh: string;
  image: string;
  imageHint: string;
  videoUrl: string;
  videoUrlPh: string;
  desc: string;
  descPh: string;
  publish: string;
  feature: string;
  create: string;
  save: string;
  del: string;
  replaceHint: string;
  requiredTitle: string;
  requiredImage: string;
  requiredVideo: string;
};

export type GalleryEditItem = {
  id: number;
  kind: "image" | "video";
  title: string;
  description: string | null;
  videoUrl: string | null;
  published: boolean;
  featured: boolean;
};

export default function GalleryForm({
  action,
  deleteAction,
  lang,
  f,
  item,
}: {
  action: (formData: FormData) => Promise<void>;
  /** edit 모드에서만 전달 — 삭제 서버 액션. */
  deleteAction?: (formData: FormData) => Promise<void>;
  lang: string;
  f: GalleryFormStrings;
  /** edit 모드에서만 전달 — 기존 항목. */
  item?: GalleryEditItem;
}) {
  const isEdit = !!item;
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  // 종류(이미지/영상)는 신규 등록에서만 전환 가능. 수정 시에는 고정.
  const [kind, setKind] = useState<"image" | "video">(item?.kind ?? "image");
  // kind 별 조건부 필드(파일/URL)는 RHF 밖에서 직접 검증합니다.
  const [extraError, setExtraError] = useState<string | null>(null);

  const schema = z.object({ title: z.string().trim().min(1, f.requiredTitle) });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ title: string }>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { title: item?.title ?? "" },
  });

  const onValid = () => {
    const form = formRef.current!;
    const fd = new FormData(form);

    if (kind === "image") {
      const file = fd.get("image");
      // 신규 등록은 파일 필수, 수정은 비워두면 기존 이미지 유지.
      if (!isEdit && (!(file instanceof File) || file.size === 0)) {
        setExtraError(f.requiredImage);
        return;
      }
    } else {
      const url = String(fd.get("videoUrl") ?? "").trim();
      if (!url) {
        setExtraError(f.requiredVideo);
        return;
      }
    }
    setExtraError(null);

    startTransition(async () => {
      await action(fd);
      if (!isEdit) {
        reset();
        form.reset();
        setKind("image");
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
          <input type="hidden" name="kind" value={kind} />
          {item && <input type="hidden" name="id" value={item.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>{f.kind}</label>
              {isEdit ? (
                <div className="inline-flex items-center rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                  {kind === "image" ? f.kindImage : f.kindVideo}
                </div>
              ) : (
                <div className="inline-flex rounded-xl border border-zinc-300 p-0.5 dark:border-zinc-700">
                  {(["image", "video"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setKind(k);
                        setExtraError(null);
                      }}
                      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                        kind === k
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                      }`}
                    >
                      {k === "image" ? f.kindImage : f.kindVideo}
                    </button>
                  ))}
                </div>
              )}
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

          {kind === "image" ? (
            <div>
              <label className={LABEL}>
                {isEdit ? f.image.replace(" *", "") : f.image}{" "}
                <span className="font-normal text-zinc-400">
                  {isEdit ? f.replaceHint : f.imageHint}
                </span>
              </label>
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={() => setExtraError(null)}
                className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:text-zinc-300 dark:file:bg-white dark:file:text-zinc-900"
              />
            </div>
          ) : (
            <div>
              <label className={LABEL}>{f.videoUrl}</label>
              <input
                name="videoUrl"
                type="url"
                defaultValue={item?.videoUrl ?? ""}
                placeholder={f.videoUrlPh}
                onChange={() => setExtraError(null)}
                className={INPUT}
              />
            </div>
          )}
          {extraError && (
            <p className="-mt-2 text-xs text-rose-500 dark:text-rose-400">
              {extraError}
            </p>
          )}

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
                defaultChecked={item ? item.featured : false}
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
                {f.del}
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
          {isEdit ? f.save : f.create}
        </button>
      </div>
    </div>
  );
}
