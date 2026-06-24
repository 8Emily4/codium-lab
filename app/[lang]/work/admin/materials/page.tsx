import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import { requireAdmin, listUsers } from "@/lib/users";
import {
  getMaterial,
  listAllMaterials,
  listGrants,
  type GrantWithUser,
  type Material,
} from "@/lib/materials";
import {
  Card,
  EmptyState,
  StatusBadge,
  WorkHeader,
  formatDate,
} from "@/components/work/ui";
import type { ManagedUser } from "@/lib/users";
import {
  createMaterialAction,
  deleteMaterialAction,
  grantAction,
  revokeGrantAction,
  updateMaterialAction,
} from "./actions";
import MaterialForm from "./MaterialForm";
import GrantForm from "./GrantForm";

const T = {
  ko: {
    eyebrow: "관리",
    title: "자료 관리",
    desc: "강의자료를 등록·편집하고, 사용자별로 기간 한정 접근권한을 부여합니다.",
    newBtn: "+ 새 자료",
    list: "자료",
    pick: "자료를 선택하거나 새로 등록하세요.",
    fTitle: "제목",
    fSummary: "한 줄 요약",
    fCategory: "분류",
    fTags: "태그 (쉼표로 구분)",
    fStatus: "상태",
    fAccess: "공개 범위",
    fBody: "본문 (마크다운)",
    accessPublic: "전체 공개 (로그인 사용자 모두)",
    accessRestricted: "제한 (권한 부여된 사용자만)",
    save: "저장",
    create: "등록",
    del: "삭제",
    preview: "미리보기",
    grants: "접근권한",
    grantsDesc: "제한 자료는 여기서 부여된 사용자만 열람할 수 있습니다.",
    addGrant: "권한 부여",
    grantUser: "사용자",
    grantStart: "시작 (선택)",
    grantEnd: "종료 (선택)",
    grantBtn: "부여",
    noGrants: "부여된 권한이 없습니다.",
    revoke: "해제",
    active: "유효",
    inactive: "기간 외",
    period: "기간",
    always: "무기한",
    onlyRestricted: "전체 공개 자료는 별도 권한이 필요 없습니다.",
    statusDraft: "초안",
    statusPublished: "공개",
    statusArchived: "보관",
    required: "필수 입력입니다",
  },
  en: {
    eyebrow: "Manage",
    title: "Manage materials",
    desc: "Create, edit, and grant time-limited access per user.",
    newBtn: "+ New",
    list: "Materials",
    pick: "Select a material or create a new one.",
    fTitle: "Title",
    fSummary: "Summary",
    fCategory: "Category",
    fTags: "Tags (comma separated)",
    fStatus: "Status",
    fAccess: "Visibility",
    fBody: "Body (markdown)",
    accessPublic: "Public (all logged-in users)",
    accessRestricted: "Restricted (granted users only)",
    save: "Save",
    create: "Create",
    del: "Delete",
    preview: "Preview",
    grants: "Access grants",
    grantsDesc: "For restricted materials, only granted users can view.",
    addGrant: "Grant access",
    grantUser: "User",
    grantStart: "Start (optional)",
    grantEnd: "End (optional)",
    grantBtn: "Grant",
    noGrants: "No grants yet.",
    revoke: "Revoke",
    active: "Active",
    inactive: "Out of window",
    period: "Period",
    always: "No limit",
    onlyRestricted: "Public materials don't require grants.",
    statusDraft: "Draft",
    statusPublished: "Published",
    statusArchived: "Archived",
    required: "This field is required",
  },
} as const;

export default async function MaterialsAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { id } = await searchParams;
  const t = T[lang === "en" ? "en" : "ko"];

  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const base = `/${lang}/work/admin/materials`;

  const [materials, users] = await Promise.all([listAllMaterials(), listUsers()]);

  const isNew = id === "new";
  const editing = !isNew && id ? await getMaterial(id) : null;
  const grants =
    editing && editing.access === "restricted"
      ? await listGrants(editing.id)
      : [];

  return (
    <>
      <WorkHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.desc}
        action={
          <Link
            href={`${base}?id=new`}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t.newBtn}
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* List */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-2 px-1 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
            {t.list} ({materials.length})
          </p>
          {materials.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 px-3 py-6 text-center text-xs text-zinc-400 dark:border-zinc-700">
              {t.pick}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {materials.map((m) => {
                const active = m.id === id;
                return (
                  <li key={m.id}>
                    <Link
                      href={`${base}?id=${m.id}`}
                      className={`block rounded-xl border p-3 transition ${
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="line-clamp-1 text-sm font-semibold">
                          {m.title}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <StatusBadge status={m.status} lang={lang} />
                        {m.access === "restricted" && (
                          <span
                            className={`text-[11px] ${active ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}
                          >
                            🔒 {m.grantCount ?? 0}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Editor */}
        <section className="min-w-0">
          {isNew ? (
            <MaterialCard lang={lang} t={t} mode="create" />
          ) : editing ? (
            <div className="space-y-6">
              <MaterialCard
                lang={lang}
                t={t}
                mode="edit"
                material={editing}
              />
              <GrantsPanel
                lang={lang}
                t={t}
                material={editing}
                grants={grants}
                users={users}
              />
            </div>
          ) : (
            <EmptyState title={t.pick} />
          )}
        </section>
      </div>
    </>
  );
}

function MaterialCard({
  lang,
  t,
  mode,
  material,
}: {
  lang: string;
  t: (typeof T)[keyof typeof T];
  mode: "create" | "edit";
  material?: Material;
}) {
  const base = `/${lang}/work`;
  return (
    <Card className="p-5 sm:p-6">
      <MaterialForm
        action={mode === "create" ? createMaterialAction : updateMaterialAction}
        lang={lang}
        t={t}
        mode={mode}
        material={
          material
            ? {
                id: material.id,
                title: material.title,
                summary: material.summary,
                category: material.category,
                tags: material.tags,
                status: material.status,
                access: material.access,
                body: material.body,
              }
            : undefined
        }
      />

      {material && (
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <Link
            href={`${base}/materials?id=${material.id}`}
            className="inline-flex h-10 items-center rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t.preview}
          </Link>
        </div>
      )}

      {material && (
        <form
          action={deleteMaterialAction}
          className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800"
        >
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="id" value={material.id} />
          <button
            type="submit"
            className="text-xs font-medium text-red-500 underline-offset-4 hover:underline"
          >
            {t.del}
          </button>
        </form>
      )}
    </Card>
  );
}

function GrantsPanel({
  lang,
  t,
  material,
  grants,
  users,
}: {
  lang: string;
  t: (typeof T)[keyof typeof T];
  material: Material;
  grants: GrantWithUser[];
  users: ManagedUser[];
}) {
  if (material.access !== "restricted") {
    return (
      <Card className="p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {t.grants}
        </h3>
        <p className="mt-2 text-sm text-zinc-400">{t.onlyRestricted}</p>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {t.grants}
      </h3>
      <p className="mt-1 text-xs text-zinc-400">{t.grantsDesc}</p>

      {/* Add grant */}
      <GrantForm
        action={grantAction}
        lang={lang}
        t={t}
        materialId={material.id}
        users={users}
      />

      {/* Current grants */}
      <div className="mt-4">
        {grants.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-400">{t.noGrants}</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {grants.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex items-center gap-3">
                  {g.userAvatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={g.userAvatar}
                      alt=""
                      className="h-8 w-8 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-700"
                    />
                  ) : (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white">
                      {(g.userName?.[0] ?? "U").toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {g.userName ?? g.userId}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {t.period}:{" "}
                      {g.startsAt ? formatDate(g.startsAt, lang) : t.always}
                      {" ~ "}
                      {g.endsAt ? formatDate(g.endsAt, lang) : t.always}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      g.active
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                    }`}
                  >
                    {g.active ? t.active : t.inactive}
                  </span>
                  <form action={revokeGrantAction}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="materialId" value={material.id} />
                    <input type="hidden" name="userId" value={g.userId} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-red-500 underline-offset-4 hover:underline"
                    >
                      {t.revoke}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
