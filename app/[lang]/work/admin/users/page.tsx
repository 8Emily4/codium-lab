import { notFound } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import {
  listUsers,
  requireSuperAdmin,
  type ManagedUser,
} from "@/lib/users";
import { Card, EmptyState, WorkHeader, formatDateTime } from "@/components/work/ui";
import { deleteUserAction, setUserRoleAction } from "./actions";

const T = {
  ko: {
    eyebrow: "관리 · 슈퍼관리자",
    title: "사용자 관리",
    desc: "로그인한 사용자에게 일반 · 관리자 · 슈퍼관리자 역할을 부여합니다. 슈퍼관리자는 다른 사용자를 슈퍼관리자로도 올릴 수 있습니다. 환경변수로 지정된 루트 슈퍼관리자와 본인 계정은 변경할 수 없습니다.",
    user: "사용자",
    role: "역할",
    lastLogin: "최근 로그인",
    action: "역할 지정",
    setRole: "(으)로 변경",
    rootLocked: "루트 · 변경 불가",
    selfLocked: "본인 · 변경 불가",
    me: "(나)",
    empty: "아직 로그인한 사용자가 없습니다.",
    noName: "(이름 없음)",
    envLocal: "로컬",
    envProd: "운영",
    del: "삭제",
    delTitle: "이 사용자 삭제",
    roles: { superAdmin: "슈퍼관리자", admin: "관리자", user: "일반" },
  },
  en: {
    eyebrow: "Manage · Super Admin",
    title: "User management",
    desc: "Assign member, admin or super-admin roles to anyone who has logged in. Super admins can grant super admin too. The env-defined root super admin and your own account can't be changed.",
    user: "User",
    role: "Role",
    lastLogin: "Last login",
    action: "Set role",
    setRole: "Change to ",
    rootLocked: "Root · locked",
    selfLocked: "You · locked",
    me: "(you)",
    empty: "No users have logged in yet.",
    noName: "(no name)",
    envLocal: "Local",
    envProd: "Production",
    del: "Delete",
    delTitle: "Delete this user",
    roles: { superAdmin: "Super Admin", admin: "Admin", user: "Member" },
  },
} as const;

const ROLE_ORDER = ["user", "admin", "superAdmin"] as const;

/** Classify the host a user logged in through into local dev vs production. */
function loginEnv(host: string | null): "local" | "prod" | null {
  if (!host) return null;
  return host.startsWith("localhost") || host.startsWith("127.")
    ? "local"
    : "prod";
}

const ROLE_BADGE: Record<ManagedUser["role"], string> = {
  superAdmin:
    "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:ring-fuchsia-900",
  admin:
    "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-900",
  user: "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700",
};

export default async function UsersAdminPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = T[lang === "en" ? "en" : "ko"];

  const admin = await requireSuperAdmin();
  if (!admin) notFound();

  const users = await listUsers();

  return (
    <>
      <WorkHeader eyebrow={t.eyebrow} title={t.title} description={t.desc} />

      {users.length === 0 ? (
        <EmptyState title={t.empty} />
      ) : (
        <Card className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {users.map((u) => {
            const isSelf = u.id === admin.id;
            const locked = u.envSuper || isSelf;
            const env = loginEnv(u.lastLoginHost);
            return (
              <div
                key={u.id}
                className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:gap-4"
              >
                {/* 신원 */}
                <div className="flex min-w-0 items-center gap-3 lg:flex-1">
                  {u.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={u.avatar}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-700"
                    />
                  ) : (
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white">
                      {(u.name?.[0] ?? "U").toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                      {u.name ?? t.noName}
                      {isSelf && (
                        <span className="ml-1.5 text-xs text-zinc-400">{t.me}</span>
                      )}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs text-zinc-400">
                        {u.email ?? u.id}
                      </p>
                      {env && (
                        <span
                          title={u.lastLoginHost ?? ""}
                          className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            env === "local"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }`}
                        >
                          {env === "local" ? t.envLocal : t.envProd}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 현재 역할 + 최근 로그인 */}
                <div className="flex items-center gap-2 lg:w-44 lg:shrink-0">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${ROLE_BADGE[u.role]}`}
                  >
                    {t.roles[u.role]}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {formatDateTime(u.lastLoginAt, lang)}
                  </span>
                </div>

                {/* 역할 지정 */}
                {locked ? (
                  <div className="text-xs text-zinc-400 lg:w-64 lg:shrink-0 lg:text-right">
                    {u.envSuper ? t.rootLocked : t.selfLocked}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5 lg:w-64 lg:shrink-0 lg:justify-end">
                    {ROLE_ORDER.map((r) => {
                      if (u.role === r) {
                        return (
                          <span
                            key={r}
                            aria-current="true"
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${ROLE_BADGE[r]}`}
                          >
                            {t.roles[r]}
                          </span>
                        );
                      }
                      return (
                        <form key={r} action={setUserRoleAction}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="role" value={r} />
                          <input type="hidden" name="lang" value={lang} />
                          <button
                            type="submit"
                            title={
                              lang === "en"
                                ? `${t.setRole}${t.roles[r]}`
                                : `${t.roles[r]}${t.setRole}`
                            }
                            className="inline-flex items-center rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                          >
                            {t.roles[r]}
                          </button>
                        </form>
                      );
                    })}
                    <form
                      action={deleteUserAction}
                      className="ml-1 border-l border-zinc-200 pl-2 dark:border-zinc-700"
                    >
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="lang" value={lang} />
                      <button
                        type="submit"
                        title={t.delTitle}
                        aria-label={t.delTitle}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </>
  );
}
