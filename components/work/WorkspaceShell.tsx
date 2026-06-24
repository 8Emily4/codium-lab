"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import type { Role } from "@/lib/auth";

type NavItem = {
  key: string;
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  adminOnly?: boolean;
  superOnly?: boolean;
};

const L = {
  ko: {
    workspace: "워크스페이스",
    main: "메인",
    manage: "관리",
    dashboard: "대시보드",
    materials: "강의자료",
    manageMaterials: "자료 관리",
    manageContent: "콘텐츠 관리",
    manageBlog: "블로그 관리",
    analytics: "방문 통계",
    users: "사용자",
    architecture: "아키텍처",
    backToSite: "사이트로",
    logout: "로그아웃",
    roles: { superAdmin: "슈퍼관리자", admin: "관리자", user: "멤버" },
  },
  en: {
    workspace: "Workspace",
    main: "Main",
    manage: "Manage",
    dashboard: "Dashboard",
    materials: "Materials",
    manageMaterials: "Manage Materials",
    manageContent: "Content",
    manageBlog: "Tech Blog",
    analytics: "Analytics",
    users: "Users",
    architecture: "Architecture",
    backToSite: "Back to site",
    logout: "Log out",
    roles: { superAdmin: "Super Admin", admin: "Admin", user: "Member" },
  },
} as const;

const ICONS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  materials: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  manageMaterials: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  content: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2.5" />
      <path d="m10 9 5 3-5 3z" />
    </>
  ),
  blog: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 7h7M9 11h5" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  architecture: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 8 9 5 9-5" />
    </>
  ),
  analytics: (
    <>
      <path d="M3 3v18h18" />
      <rect x="7" y="11" width="3" height="6" rx="0.5" />
      <rect x="12" y="7" width="3" height="10" rx="0.5" />
      <rect x="17" y="13" width="3" height="4" rx="0.5" />
    </>
  ),
} as const;

function NavIcon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      {ICONS[name]}
    </svg>
  );
}

const ROLE_BADGE: Record<Role, string> = {
  superAdmin:
    "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 ring-fuchsia-500/30",
  admin: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 ring-indigo-500/30",
  user: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 ring-zinc-500/20",
};

export default function WorkspaceShell({
  lang,
  role,
  user,
  children,
}: {
  lang: string;
  role: Role;
  user: { id: string; name: string; email?: string; avatar?: string };
  children: React.ReactNode;
}) {
  const t = L[lang === "en" ? "en" : "ko"];
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const base = `/${lang}/work`;
  const isAdmin = role === "admin" || role === "superAdmin";

  const mainItems: NavItem[] = [
    { key: "dashboard", href: base, label: t.dashboard, icon: "dashboard" },
    {
      key: "materials",
      href: `${base}/materials`,
      label: t.materials,
      icon: "materials",
    },
  ];
  const manageItems: NavItem[] = [
    {
      key: "admin-materials",
      href: `${base}/admin/materials`,
      label: t.manageMaterials,
      icon: "manageMaterials",
      adminOnly: true,
    },
    {
      key: "admin-content",
      href: `${base}/admin/content`,
      label: t.manageContent,
      icon: "content",
      adminOnly: true,
    },
    {
      key: "admin-blog",
      href: `${base}/admin/blog`,
      label: t.manageBlog,
      icon: "blog",
      adminOnly: true,
    },
    {
      key: "admin-analytics",
      href: `${base}/admin/analytics`,
      label: t.analytics,
      icon: "analytics",
      adminOnly: true,
    },
    {
      key: "admin-users",
      href: `${base}/admin/users`,
      label: t.users,
      icon: "users",
      adminOnly: true,
      superOnly: true,
    },
    {
      key: "admin-architecture",
      href: `${base}/admin/architecture`,
      label: t.architecture,
      icon: "architecture",
      adminOnly: true,
    },
  ];

  function isActive(href: string) {
    if (href === base) return pathname === base || pathname === `${base}/`;
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  const isSuper = role === "superAdmin";
  function renderItems(items: NavItem[]) {
    return items
      .filter((i) => (!i.adminOnly || isAdmin) && (!i.superOnly || isSuper))
      .map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setDrawer(false)}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
            }`}
          >
            <NavIcon name={item.icon} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      });
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-1 p-4">
      <Link
        href={base}
        onClick={() => setDrawer(false)}
        className="mb-4 flex items-center gap-2.5 px-1"
      >
        <Logo className="h-8 w-8 shrink-0" />
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {lang === "en" ? "Codium Lab" : "코디움랩"}
          </p>
          <p className="text-[11px] font-medium tracking-[0.14em] text-zinc-400 uppercase">
            {t.workspace}
          </p>
        </div>
      </Link>

      <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">
        {t.main}
      </p>
      <nav className="flex flex-col gap-1">{renderItems(mainItems)}</nav>

      {isAdmin && (
        <>
          <p className="px-3 pt-4 pb-1 text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">
            {t.manage}
          </p>
          <nav className="flex flex-col gap-1">{renderItems(manageItems)}</nav>
        </>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-4">
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-900/60">
          {user.avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.avatar}
              alt=""
              className="h-9 w-9 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-700"
            />
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-bold text-white">
              {(user.name?.[0] ?? "U").toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {user.name}
            </p>
            <span
              className={`mt-0.5 inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-semibold ring-1 ${ROLE_BADGE[role]}`}
            >
              {t.roles[role]}
            </span>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {t.logout}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-white lg:block dark:border-zinc-800 dark:bg-zinc-900">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-xl sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/80">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 lg:hidden dark:border-zinc-700 dark:text-zinc-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
          <span className="text-sm font-semibold lg:hidden">{t.workspace}</span>
          <div className="flex flex-1 items-center justify-end">
            <Link
              href={`/${lang}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m12 19-7-7 7-7M19 12H5" />
              </svg>
              {t.backToSite}
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
