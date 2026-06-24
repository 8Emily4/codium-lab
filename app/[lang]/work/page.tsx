import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../dictionaries";
import { getSessionWithRole, listUsers } from "@/lib/users";
import {
  listAllMaterials,
  listMaterialsForViewer,
  type ViewerMaterial,
} from "@/lib/materials";
import {
  Card,
  EmptyState,
  StatCard,
  StatusBadge,
  WorkHeader,
  formatDate,
} from "@/components/work/ui";

const T = {
  ko: {
    eyebrow: "대시보드",
    hello: (name: string) => `${name}님, 환영합니다`,
    descAdmin: "강의자료와 사용자, 접근권한을 한곳에서 운영하세요.",
    descUser: "현재 열람 가능한 강의자료를 확인하세요.",
    statMaterials: "전체 자료",
    statPublished: "공개 자료",
    statUsers: "사용자",
    myMaterials: "내 강의자료",
    available: "열람 가능",
    recent: "최근 자료",
    viewAll: "전체 보기",
    manageMaterials: "자료 관리",
    manageUsers: "사용자 관리",
    emptyUser: "아직 열람 가능한 자료가 없습니다",
    emptyUserDesc: "관리자가 자료에 접근권한을 부여하면 여기에 표시됩니다.",
    until: (d: string) => `${d}까지`,
    expired: "기간 만료",
    upcoming: "열람 예정",
  },
  en: {
    eyebrow: "Dashboard",
    hello: (name: string) => `Welcome, ${name}`,
    descAdmin: "Manage materials, members and access in one place.",
    descUser: "See the materials available to you right now.",
    statMaterials: "Total materials",
    statPublished: "Published",
    statUsers: "Users",
    myMaterials: "My materials",
    available: "Available",
    recent: "Recent",
    viewAll: "View all",
    manageMaterials: "Manage materials",
    manageUsers: "Manage users",
    emptyUser: "No materials available yet",
    emptyUserDesc: "They'll appear here once an admin grants you access.",
    until: (d: string) => `until ${d}`,
    expired: "Expired",
    upcoming: "Upcoming",
  },
} as const;

export default async function WorkDashboard({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = T[lang === "en" ? "en" : "ko"];

  const ctx = await getSessionWithRole();
  if (!ctx) notFound();
  const { session, role } = ctx;
  const isAdmin = role === "admin" || role === "superAdmin";
  const base = `/${lang}/work`;

  if (isAdmin) {
    const [materials, users] = await Promise.all([listAllMaterials(), listUsers()]);
    const published = materials.filter((m) => m.status === "published").length;
    return (
      <>
        <WorkHeader
          eyebrow={t.eyebrow}
          title={t.hello(session.name)}
          description={t.descAdmin}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label={t.statMaterials}
            value={materials.length}
            href={`${base}/admin/materials`}
          />
          <StatCard label={t.statPublished} value={published} />
          <StatCard
            label={t.statUsers}
            value={users.length}
            href={`${base}/admin/users`}
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`${base}/admin/materials`}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t.manageMaterials}
          </Link>
          <Link
            href={`${base}/admin/users`}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t.manageUsers}
          </Link>
        </div>

        <h2 className="mt-10 mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          {t.recent}
        </h2>
        <RecentList lang={lang} items={materials.slice(0, 5)} base={base} />
      </>
    );
  }

  // Member view
  const materials = await listMaterialsForViewer(session.id, role);
  const availableCount = materials.filter(
    (m) => m.accessState === "open",
  ).length;
  return (
    <>
      <WorkHeader
        eyebrow={t.eyebrow}
        title={t.hello(session.name)}
        description={t.descUser}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label={t.available}
          value={availableCount}
          href={`${base}/materials`}
        />
      </div>
      <h2 className="mt-10 mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
        {t.myMaterials}
      </h2>
      {materials.length === 0 ? (
        <EmptyState title={t.emptyUser} description={t.emptyUserDesc} />
      ) : (
        <ViewerList lang={lang} items={materials.slice(0, 6)} base={base} t={t} />
      )}
    </>
  );
}

function RecentList({
  lang,
  items,
  base,
}: {
  lang: string;
  items: Awaited<ReturnType<typeof listAllMaterials>>;
  base: string;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={lang === "en" ? "No materials yet" : "아직 자료가 없습니다"}
      />
    );
  }
  return (
    <Card>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {items.map((m) => (
          <li key={m.id}>
            <Link
              href={`${base}/admin/materials?id=${m.id}`}
              className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {m.title}
                </p>
                <p className="truncate text-xs text-zinc-400">
                  {formatDate(m.updatedAt, lang)}
                </p>
              </div>
              <StatusBadge status={m.status} lang={lang} />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ViewerList({
  lang,
  items,
  base,
  t,
}: {
  lang: string;
  items: ViewerMaterial[];
  base: string;
  t: (typeof T)[keyof typeof T];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((m) => (
        <Link
          key={m.id}
          href={`${base}/materials?id=${m.id}`}
          className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <p className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {m.title}
          </p>
          {m.summary && (
            <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
              {m.summary}
            </p>
          )}
          {m.accessState === "expired" ? (
            <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
              {t.expired}
            </p>
          ) : m.accessState === "upcoming" ? (
            <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              {t.upcoming}
            </p>
          ) : (
            m.accessEndsAt && (
              <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                {t.until(formatDate(m.accessEndsAt, lang))}
              </p>
            )
          )}
        </Link>
      ))}
    </div>
  );
}
