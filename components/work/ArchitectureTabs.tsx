"use client";

import { useState } from "react";
import Mermaid from "@/components/work/Mermaid";
import {
  SYSTEM_ARCHITECTURE,
  DB_ERD,
  AUTH_FLOW,
  ROUTE_TREE,
} from "@/components/work/architectureDiagrams";

type Point = { label: string; desc: string };
type Tab = {
  id: string;
  label: string;
  icon: keyof typeof ICONS;
  title: string;
  subtitle: string;
  chart: string;
  accent: string; // gradient bar
  points: Point[];
};

const ICONS = {
  layers: (
    <>
      <path d="m12 2 9 5-9 5-9-5 9-5z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  tree: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <path d="M6 9v6a2 2 0 0 0 2 2h7M18 9v6" />
    </>
  ),
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      width="17"
      height="17"
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

const TABS: Tab[] = [
  {
    id: "system",
    label: "시스템 아키텍처",
    icon: "layers",
    title: "시스템 아키텍처",
    subtitle:
      "클라이언트 → 엣지 미들웨어 → Next.js App Router → 도메인 레이어(lib) → Turso 데이터베이스로 이어지는 전체 흐름입니다.",
    chart: SYSTEM_ARCHITECTURE,
    accent: "from-violet-500 to-indigo-600",
    points: [
      {
        label: "Next.js 16 · React 19",
        desc: "App Router 기반. 서버 컴포넌트가 기본이며, 변경은 서버 액션(actions.ts)으로 처리합니다.",
      },
      {
        label: "엣지 미들웨어",
        desc: "middleware.ts 가 요청 언어를 감지해 x-lang 헤더와 /[lang] 경로로 리라이트합니다.",
      },
      {
        label: "도메인 레이어 (lib/)",
        desc: "auth · users · materials · media · brand 로 책임을 분리해 서버 코드에서만 호출합니다.",
      },
      {
        label: "Turso (libSQL)",
        desc: "SQLite 호환 서버리스 DB. @libsql/client 로 접속하며 스키마는 부팅 시 자동 생성됩니다.",
      },
    ],
  },
  {
    id: "erd",
    label: "DB ERD",
    icon: "database",
    title: "데이터베이스 ERD",
    subtitle:
      "5개 테이블로 구성됩니다. users·materials·material_grants 가 강의자료 접근권한 모델의 핵심이고, media_contents·inquiries 는 콘텐츠/문의를 담당합니다.",
    chart: DB_ERD,
    accent: "from-cyan-500 to-blue-600",
    points: [
      {
        label: "users",
        desc: "OAuth 사용자. role 은 user/admin 만 저장하고 superAdmin 은 환경변수로만 부여돼 위변조가 불가능합니다.",
      },
      {
        label: "materials ↔ material_grants",
        desc: "자료별 접근권한을 (자료×사용자×기간)으로 부여. UNIQUE(material_id, user_id) 로 중복을 막습니다.",
      },
      {
        label: "기간 기반 권한",
        desc: "starts_at/ends_at (unix초, NULL=무기한)으로 노출 기간을 제어합니다.",
      },
      {
        label: "media_contents · inquiries",
        desc: "AI 제작 미디어 노출과 도입 문의 접수를 각각 담당하는 독립 테이블입니다.",
      },
    ],
  },
  {
    id: "auth",
    label: "인증 · 권한",
    icon: "shield",
    title: "인증 · 권한(RBAC) 흐름",
    subtitle:
      "Kakao OAuth 로그인부터 HMAC 서명 세션 발급, 보호 라우트 접근 시 역할 해석까지의 전체 시퀀스입니다.",
    chart: AUTH_FLOW,
    accent: "from-fuchsia-500 to-pink-600",
    points: [
      {
        label: "무상태 세션",
        desc: "DB 세션 테이블 없이 HMAC-SHA256 으로 서명한 httpOnly 쿠키만으로 검증합니다.",
      },
      {
        label: "CSRF 방지",
        desc: "로그인 시작 시 state 를 쿠키에 저장하고 콜백에서 일치 여부를 확인합니다.",
      },
      {
        label: "역할 3단계",
        desc: "user · admin · superAdmin. superAdmin 은 SUPER_ADMIN_IDS 환경변수로만 결정됩니다.",
      },
      {
        label: "매 요청 재해석",
        desc: "resolveRole() 이 매 요청마다 역할을 다시 계산해 만료된 쿠키 권한을 신뢰하지 않습니다.",
      },
    ],
  },
  {
    id: "routes",
    label: "라우트 구조",
    icon: "tree",
    title: "라우트 · 디렉터리 구조",
    subtitle:
      "app/[lang] 아래 (site)·(auth)·work·api 로 나뉩니다. work 이하는 로그인이 필요하고, admin 은 관리자, users 는 슈퍼관리자 전용입니다.",
    chart: ROUTE_TREE,
    accent: "from-amber-500 to-orange-600",
    points: [
      {
        label: "(site) 공개 영역",
        desc: "홈·서비스·미디어·문의 등 비로그인 접근이 가능한 마케팅/콘텐츠 페이지입니다.",
      },
      {
        label: "/work 워크스페이스",
        desc: "layout.tsx 에서 세션을 검사해 비로그인 사용자를 로그인 페이지로 보냅니다.",
      },
      {
        label: "admin 게이팅",
        desc: "requireAdmin / requireSuperAdmin 으로 페이지·서버 액션 단위 권한을 강제합니다.",
      },
      {
        label: "api/ 라우트 핸들러",
        desc: "OAuth 콜백·로그아웃·문의 접수 등 서버 전용 엔드포인트를 제공합니다.",
      },
    ],
  },
];

export default function ArchitectureTabs() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div>
      {/* Tab bar */}
      <div className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              aria-current={on ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                on
                  ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                  : "border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
              }`}
            >
              <Icon name={t.icon} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active tab header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {tab.title}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {tab.subtitle}
        </p>
      </div>

      {/* Diagram canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <span
          aria-hidden
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tab.accent}`}
        />
        <div
          aria-hidden
          className="bg-dots pointer-events-none absolute inset-0 opacity-40"
        />
        <div className="relative p-4 sm:p-8">
          <Mermaid key={tab.id} chart={tab.chart} />
        </div>
      </div>

      {/* Key points */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tab.points.map((p) => (
          <div
            key={p.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className={`mt-1 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br ${tab.accent}`}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {p.label}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {p.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
