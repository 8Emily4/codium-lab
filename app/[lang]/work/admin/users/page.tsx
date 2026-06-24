import { notFound } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import {
  listUsers,
  requireSuperAdmin,
  type ManagedUser,
} from "@/lib/users";
import { Card, EmptyState, WorkHeader, formatDateTime } from "@/components/work/ui";
import { setUserRoleAction } from "./actions";

const T = {
  ko: {
    eyebrow: "관리 · 슈퍼관리자",
    title: "사용자 관리",
    desc: "로그인한 사용자를 관리자로 지정/해제합니다. 슈퍼관리자는 환경변수(SUPER_ADMIN_IDS)로만 지정됩니다.",
    user: "사용자",
    role: "역할",
    lastLogin: "최근 로그인",
    action: "관리",
    makeAdmin: "관리자 지정",
    removeAdmin: "관리자 해제",
    locked: "변경 불가",
    me: "(나)",
    empty: "아직 로그인한 사용자가 없습니다.",
    noName: "(이름 없음)",
    roles: { superAdmin: "슈퍼관리자", admin: "관리자", user: "일반" },
  },
  en: {
    eyebrow: "Manage · Super Admin",
    title: "User management",
    desc: "Promote or demote members. Super admins are set only via SUPER_ADMIN_IDS.",
    user: "User",
    role: "Role",
    lastLogin: "Last login",
    action: "Action",
    makeAdmin: "Make admin",
    removeAdmin: "Remove admin",
    locked: "Locked",
    me: "(you)",
    empty: "No users have logged in yet.",
    noName: "(no name)",
    roles: { superAdmin: "Super Admin", admin: "Admin", user: "Member" },
  },
} as const;

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
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">{t.user}</th>
                  <th className="px-4 py-3 font-medium">{t.role}</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    {t.lastLogin}
                  </th>
                  <th className="px-4 py-3 text-right font-medium">{t.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {users.map((u) => {
                  const isSelf = u.id === admin.id;
                  const isSuper = u.role === "superAdmin";
                  const nextRole = u.role === "admin" ? "user" : "admin";
                  return (
                    <tr key={u.id} className="bg-white dark:bg-zinc-900">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={u.avatar}
                              alt=""
                              className="h-8 w-8 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-700"
                            />
                          ) : (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white">
                              {(u.name?.[0] ?? "U").toUpperCase()}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                              {u.name ?? t.noName}
                              {isSelf && (
                                <span className="ml-1.5 text-xs text-zinc-400">
                                  {t.me}
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-zinc-400">
                              {u.email ?? u.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${ROLE_BADGE[u.role]}`}
                        >
                          {t.roles[u.role]}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-zinc-500 sm:table-cell dark:text-zinc-400">
                        {formatDateTime(u.lastLoginAt, lang)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isSuper ? (
                          <span className="text-xs text-zinc-400">
                            {t.locked}
                          </span>
                        ) : (
                          <form action={setUserRoleAction} className="inline">
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="role" value={nextRole} />
                            <input type="hidden" name="lang" value={lang} />
                            <button
                              type="submit"
                              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                nextRole === "admin"
                                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                                  : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                              }`}
                            >
                              {nextRole === "admin" ? t.makeAdmin : t.removeAdmin}
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
