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
  grantUser: string;
  grantStart: string;
  grantEnd: string;
  grantBtn: string;
  required: string;
};

type GrantUser = {
  id: string;
  name: string | null;
  email: string | null;
};

export default function GrantForm({
  action,
  lang,
  t,
  materialId,
  users,
}: {
  action: (formData: FormData) => void | Promise<void>;
  lang: string;
  t: Dict;
  materialId: string;
  users: GrantUser[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const schema = z.object({
    userId: z.string().min(1, t.required),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ userId: string }>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { userId: users[0]?.id ?? "" },
  });

  const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      e.currentTarget.showPicker();
    } catch {
      // showPicker 미지원 브라우저는 기본 동작 유지
    }
  };

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
      className="mt-4 flex flex-col gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/60"
    >
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="materialId" value={materialId} />
      <div>
        <label className={labelCls}>{t.grantUser}</label>
        <select
          {...register("userId")}
          aria-invalid={errors.userId ? "true" : "false"}
          className={errors.userId ? inputErrCls : inputCls}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name ?? u.id}
              {u.email ? ` · ${u.email}` : ""}
            </option>
          ))}
        </select>
        {errors.userId && (
          <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
            {errors.userId.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{t.grantStart}</label>
          <input
            type="datetime-local"
            name="startsAt"
            className={inputCls}
            onClick={openPicker}
          />
        </div>
        <div>
          <label className={labelCls}>{t.grantEnd}</label>
          <input
            type="datetime-local"
            name="endsAt"
            className={inputCls}
            onClick={openPicker}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 sm:self-start dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {t.grantBtn}
      </button>
    </form>
  );
}
