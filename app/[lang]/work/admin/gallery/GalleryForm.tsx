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
  requiredTitle: string;
  requiredImage: string;
  requiredVideo: string;
};

export default function GalleryForm({
  action,
  lang,
  f,
}: {
  action: (formData: FormData) => Promise<void>;
  lang: string;
  f: GalleryFormStrings;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [kind, setKind] = useState<"image" | "video">("image");
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
    defaultValues: { title: "" },
  });

  const onValid = () => {
    const form = formRef.current!;
    const fd = new FormData(form);

    if (kind === "image") {
      const file = fd.get("image");
      if (!(file instanceof File) || file.size === 0) {
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
      reset();
      form.reset();
      setKind("image");
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onValid)} noValidate className="space-y-4">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="kind" value={kind} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>{f.kind}</label>
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

      {kind === "image" ? (
        <div>
          <label className={LABEL}>
            {f.image} <span className="font-normal text-zinc-400">{f.imageHint}</span>
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
            placeholder={f.videoUrlPh}
            onChange={() => setExtraError(null)}
            className={INPUT}
          />
        </div>
      )}
      {extraError && (
        <p className="-mt-2 text-xs text-rose-500 dark:text-rose-400">{extraError}</p>
      )}

      <div>
        <label className={LABEL}>{f.desc}</label>
        <textarea name="description" rows={2} placeholder={f.descPh} className={`${INPUT} resize-y`} />
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
          {f.create}
        </button>
      </div>
    </form>
  );
}
