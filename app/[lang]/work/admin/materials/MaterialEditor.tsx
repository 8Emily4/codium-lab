"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DetailShell,
  DetailTab,
  Field,
  FieldGrid,
  inputCls,
  inputErrCls,
} from "@/components/work/layout";

const FORM_ID = "material-detail-form";

type Dict = {
  fTitle: string;
  fSummary: string;
  fCategory: string;
  fTags: string;
  fStatus: string;
  fAccess: string;
  fPrice: string;
  pricePh: string;
  priceUnit: string;
  fBody: string;
  accessPublic: string;
  accessRestricted: string;
  badgeFree: string;
  badgePaid: string;
  save: string;
  create: string;
  del: string;
  preview: string;
  detailTab: string;
  grants: string;
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
  price: number | null;
  body: string;
};

export default function MaterialEditor({
  action,
  deleteAction,
  lang,
  t,
  mode,
  material,
  previewHref,
  grantsSlot,
}: {
  action: (formData: FormData) => void | Promise<void>;
  /** edit 모드에서만 전달 — 삭제 서버 액션. */
  deleteAction?: (formData: FormData) => void | Promise<void>;
  lang: string;
  t: Dict;
  mode: "create" | "edit";
  material?: MaterialData;
  /** edit 모드에서만 전달 — 자료 미리보기 경로. */
  previewHref?: string;
  /** edit 모드에서만 전달 — 접근권한 탭 콘텐츠(서버에서 렌더). */
  grantsSlot?: ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<"detail" | "access">("detail");
  // 무료(public) / 유료(restricted) — 유료일 때만 가격 입력란을 보여준다.
  const [access, setAccess] = useState<string>(material?.access ?? "restricted");
  const isPaid = access === "restricted";

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

  const isEdit = mode === "edit";

  return (
    <DetailShell
      tabs={
        isEdit ? (
          <>
            <DetailTab active={tab === "detail"} onClick={() => setTab("detail")}>
              {t.detailTab}
            </DetailTab>
            <DetailTab active={tab === "access"} onClick={() => setTab("access")}>
              {t.grants}
            </DetailTab>
          </>
        ) : undefined
      }
      footer={
        <>
          <div>
            {isEdit && deleteAction && material && (
              <form action={deleteAction}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={material.id} />
                <button
                  type="submit"
                  className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  {t.del}
                </button>
              </form>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEdit && previewHref && (
              <Link
                href={previewHref}
                className="inline-flex h-10 items-center rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {t.preview}
              </Link>
            )}
            <button
              type="submit"
              form={FORM_ID}
              disabled={pending}
              className="inline-flex h-10 items-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mode === "create" ? t.create : t.save}
            </button>
          </div>
        </>
      }
    >
      {/* 상세 탭: 마운트 유지(숨김)해 어느 탭에서든 저장 가능 */}
      <div className={tab === "detail" ? "" : "hidden"}>
        <form
          id={FORM_ID}
          ref={formRef}
          onSubmit={handleSubmit(onValid)}
          noValidate
        >
          <input type="hidden" name="lang" value={lang} />
          {material && <input type="hidden" name="id" value={material.id} />}

          <FieldGrid>
            <Field label={t.fTitle} error={errors.title?.message} wide>
              <input
                {...register("title")}
                defaultValue={material?.title ?? ""}
                aria-invalid={errors.title ? "true" : "false"}
                className={errors.title ? inputErrCls : inputCls}
                placeholder={t.fTitle}
              />
            </Field>

            <Field label={t.fSummary} wide>
              <input
                name="summary"
                defaultValue={material?.summary ?? ""}
                className={inputCls}
              />
            </Field>

            <Field label={t.fCategory}>
              <input
                name="category"
                defaultValue={material?.category ?? ""}
                className={inputCls}
              />
            </Field>
            <Field label={t.fTags}>
              <input
                name="tags"
                defaultValue={material?.tags.join(", ") ?? ""}
                className={inputCls}
                placeholder="React, Next.js"
              />
            </Field>

            <Field label={t.fStatus}>
              <select
                name="status"
                defaultValue={material?.status ?? "draft"}
                className={inputCls}
              >
                <option value="draft">{t.statusDraft}</option>
                <option value="published">{t.statusPublished}</option>
                <option value="archived">{t.statusArchived}</option>
              </select>
            </Field>
            <Field label={t.fAccess}>
              {/* 무료/유료 세그먼트 토글 — 클릭으로 바로 전환. 값은 hidden input 으로 전송 */}
              <input type="hidden" name="access" value={access} />
              <div className="inline-flex w-full rounded-lg border border-zinc-300 p-0.5 dark:border-zinc-700">
                {(
                  [
                    { v: "public", label: t.badgeFree },
                    { v: "restricted", label: t.badgePaid },
                  ] as const
                ).map((opt) => {
                  const on = access === opt.v;
                  return (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setAccess(opt.v)}
                      aria-pressed={on}
                      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                        on
                          ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs text-zinc-400">
                {isPaid ? t.accessRestricted : t.accessPublic}
              </p>
            </Field>

            {/* 유료일 때만 가격(원) 입력 — 무료로 바꿔도 값은 보존되며 저장 시 무시됨 */}
            <Field label={t.fPrice}>
              <div className="relative">
                <input
                  name="price"
                  type="number"
                  min={0}
                  step={1000}
                  inputMode="numeric"
                  defaultValue={material?.price ?? ""}
                  disabled={!isPaid}
                  className={`${inputCls} pr-10 disabled:cursor-not-allowed disabled:opacity-50`}
                  placeholder={isPaid ? t.pricePh : "—"}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-zinc-400">
                  {t.priceUnit}
                </span>
              </div>
            </Field>

            <Field label={t.fBody} wide>
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
            </Field>
          </FieldGrid>
        </form>
      </div>

      {/* 접근권한 탭 */}
      {isEdit && (
        <div className={tab === "access" ? "" : "hidden"}>{grantsSlot}</div>
      )}
    </DetailShell>
  );
}
