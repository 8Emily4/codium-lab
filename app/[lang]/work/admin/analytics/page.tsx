import { notFound } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import { requireAdmin } from "@/lib/users";
import {
  getDailyStats,
  getOverview,
  getSourceBreakdown,
  getTopPaths,
  getTopReferrers,
  type VisitSource,
} from "@/lib/analytics";
import { Card, EmptyState, StatCard, WorkHeader } from "@/components/work/ui";

export const dynamic = "force-dynamic";

type Strings = {
  eyebrow: string;
  title: string;
  desc: string;
  todayVisitors: string;
  todayViews: string;
  totalVisitors: string;
  totalViews: string;
  people: string;
  views: string;
  dailyTitle: string;
  dailyDesc: string;
  date: string;
  sourcesTitle: string;
  sourcesDesc: string;
  referrersTitle: string;
  referrersDesc: string;
  pathsTitle: string;
  pathsDesc: string;
  page: string;
  empty: string;
  windowNote: string;
  sourceLabels: Record<VisitSource, string>;
};

const T: Record<"ko" | "en", Strings> = {
  ko: {
    eyebrow: "관리",
    title: "방문 통계",
    desc: "사이트 방문 현황을 한눈에 봅니다. IP는 저장하지 않으며, 익명 쿠키로 방문자 수를 셉니다.",
    todayVisitors: "오늘 방문자",
    todayViews: "오늘 조회수",
    totalVisitors: "누적 방문자",
    totalViews: "누적 조회수",
    people: "명",
    views: "회",
    dailyTitle: "날짜별 방문",
    dailyDesc: "최근 30일 (KST 기준)",
    date: "날짜",
    sourcesTitle: "유입 경로",
    sourcesDesc: "최근 30일 동안 어디서 들어왔는지",
    referrersTitle: "유입 사이트 TOP",
    referrersDesc: "외부에서 링크를 타고 들어온 출처",
    pathsTitle: "많이 본 페이지",
    pathsDesc: "최근 30일 조회수 상위",
    page: "페이지",
    empty: "아직 방문 데이터가 없습니다.",
    windowNote: "최근 30일",
    sourceLabels: {
      direct: "직접 방문",
      search: "검색",
      social: "SNS",
      referral: "외부 링크",
    },
  },
  en: {
    eyebrow: "Manage",
    title: "Analytics",
    desc: "A quick look at site traffic. We never store IPs — visitors are counted with an anonymous cookie.",
    todayVisitors: "Today's visitors",
    todayViews: "Today's views",
    totalVisitors: "Total visitors",
    totalViews: "Total views",
    people: "",
    views: "",
    dailyTitle: "Daily visits",
    dailyDesc: "Last 30 days (KST)",
    date: "Date",
    sourcesTitle: "Traffic sources",
    sourcesDesc: "Where visitors came from in the last 30 days",
    referrersTitle: "Top referrers",
    referrersDesc: "External sites that linked here",
    pathsTitle: "Top pages",
    pathsDesc: "Most viewed in the last 30 days",
    page: "Page",
    empty: "No visit data yet.",
    windowNote: "Last 30 days",
    sourceLabels: {
      direct: "Direct",
      search: "Search",
      social: "Social",
      referral: "Referral",
    },
  },
};

const SOURCE_STYLE: Record<VisitSource, string> = {
  direct: "bg-zinc-400",
  search: "bg-emerald-500",
  social: "bg-fuchsia-500",
  referral: "bg-indigo-500",
};

function fmt(n: number, lang: string): string {
  return n.toLocaleString(lang === "en" ? "en-US" : "ko-KR");
}

export default async function WorkAnalytics({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = T[lang === "en" ? "en" : "ko"];

  // Admin or super-admin only.
  const ctx = await requireAdmin();
  if (!ctx) notFound();

  const [overview, daily, sources, referrers, paths] = await Promise.all([
    getOverview(),
    getDailyStats(30),
    getSourceBreakdown(30),
    getTopReferrers(30, 8),
    getTopPaths(30, 10),
  ]);

  const hasData = overview.totalViews > 0;
  const maxDaily = Math.max(1, ...daily.map((d) => d.views));
  const sourceTotal = Math.max(
    1,
    sources.reduce((s, r) => s + r.views, 0),
  );
  const maxPath = Math.max(1, ...paths.map((p) => p.views));

  function dayLabel(day: string): string {
    // day is "YYYY-MM-DD" in KST.
    const [, m, d] = day.split("-");
    return lang === "en" ? `${m}/${d}` : `${Number(m)}월 ${Number(d)}일`;
  }

  return (
    <>
      <WorkHeader eyebrow={t.eyebrow} title={t.title} description={t.desc} />

      {/* Overview cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t.todayVisitors}
          value={fmt(overview.todayVisitors, lang)}
          hint={`${t.todayViews} ${fmt(overview.todayViews, lang)}`}
        />
        <StatCard
          label={t.totalVisitors}
          value={fmt(overview.totalVisitors, lang)}
          hint={`${t.totalViews} ${fmt(overview.totalViews, lang)}`}
        />
        <StatCard label={t.todayViews} value={fmt(overview.todayViews, lang)} />
        <StatCard label={t.totalViews} value={fmt(overview.totalViews, lang)} />
      </div>

      {!hasData ? (
        <EmptyState title={t.empty} />
      ) : (
        <div className="space-y-8">
          {/* Daily */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {t.dailyTitle}
              <span className="ml-2 text-xs font-normal text-zinc-400">
                {t.dailyDesc}
              </span>
            </h2>
            <ul className="mt-5 space-y-2">
              {daily.map((d) => (
                <li key={d.day} className="flex items-center gap-3 text-sm">
                  <span className="w-20 shrink-0 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {dayLabel(d.day)}
                  </span>
                  <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                      style={{ width: `${(d.views / maxDaily) * 100}%` }}
                    />
                  </div>
                  <span className="w-28 shrink-0 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                    <strong className="text-zinc-900 dark:text-zinc-100">
                      {fmt(d.visitors, lang)}
                    </strong>
                    {t.people} · {fmt(d.views, lang)}
                    {t.views}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Sources */}
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {t.sourcesTitle}
                <span className="ml-2 text-xs font-normal text-zinc-400">
                  {t.sourcesDesc}
                </span>
              </h2>
              <ul className="mt-5 space-y-3">
                {sources.map((s) => {
                  const pct = Math.round((s.views / sourceTotal) * 100);
                  return (
                    <li key={s.source}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-200">
                          <span
                            className={`inline-block h-2.5 w-2.5 rounded-full ${SOURCE_STYLE[s.source]}`}
                          />
                          {t.sourceLabels[s.source]}
                        </span>
                        <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                          {pct}% · {fmt(s.views, lang)}
                          {t.views}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className={`h-full rounded-full ${SOURCE_STYLE[s.source]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>

            {/* Referrers */}
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {t.referrersTitle}
                <span className="ml-2 text-xs font-normal text-zinc-400">
                  {t.referrersDesc}
                </span>
              </h2>
              {referrers.length === 0 ? (
                <p className="mt-5 text-sm text-zinc-400">
                  {lang === "en" ? "No external referrers yet." : "외부 유입이 아직 없습니다."}
                </p>
              ) : (
                <ul className="mt-5 space-y-2.5">
                  {referrers.map((r) => (
                    <li
                      key={r.host}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate text-zinc-700 dark:text-zinc-200">
                        {r.host}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                        {fmt(r.views, lang)}
                        {t.views}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Top paths */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {t.pathsTitle}
              <span className="ml-2 text-xs font-normal text-zinc-400">
                {t.pathsDesc}
              </span>
            </h2>
            <ul className="mt-5 space-y-2">
              {paths.map((p) => (
                <li key={p.path} className="flex items-center gap-3 text-sm">
                  <div className="relative min-w-0 flex-1">
                    <div
                      className="absolute inset-y-0 left-0 rounded-md bg-indigo-50 dark:bg-indigo-950/40"
                      style={{ width: `${(p.views / maxPath) * 100}%` }}
                    />
                    <span className="relative truncate px-2 py-1 font-mono text-xs text-zinc-700 dark:text-zinc-200">
                      {p.path}
                    </span>
                  </div>
                  <span className="w-28 shrink-0 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                    <strong className="text-zinc-900 dark:text-zinc-100">
                      {fmt(p.visitors, lang)}
                    </strong>
                    {t.people} · {fmt(p.views, lang)}
                    {t.views}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
