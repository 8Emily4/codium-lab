import Reveal from "@/components/Reveal";

function ArrowSvg() {
  return (
    <div className="flex-none self-start mt-[52px] px-1">
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none" aria-hidden>
        <path
          d="M0 8 H26 M22 3 L30 8 L22 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-500 dark:text-zinc-600"
        />
      </svg>
    </div>
  );
}

export default function HarnessDiagram() {
  return (
    <div className="overflow-x-auto pb-4 -mx-2 px-2">
      <div className="flex items-start min-w-[860px] gap-0">

        {/* Stage 1: Trigger */}
        <Reveal delay={0} className="relative flex flex-col rounded-2xl border border-violet-500/30 bg-violet-500/8 p-5 w-[160px] flex-none">
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-violet-500 to-purple-600" />
          <p className="text-[9px] font-semibold tracking-[0.22em] text-violet-400 uppercase">01 · TRIGGER</p>
          <h4 className="mt-2 text-sm font-semibold text-zinc-100">이슈 감지</h4>
          <p className="text-[10px] text-violet-400/70 mb-3">AutoPilot</p>
          <ul className="space-y-1.5 mt-auto">
            {["JQL 조건 감지", "오토파일럿 트리거", "이슈 유형 분류"].map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-violet-500 opacity-70" aria-hidden />
                <span className="font-mono text-[11px] leading-relaxed text-zinc-400">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <ArrowSvg />

        {/* Stage 2: Harness Control */}
        <Reveal delay={100} className="relative flex flex-col rounded-2xl border border-indigo-500/30 bg-indigo-500/8 p-5 w-[160px] flex-none">
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-indigo-500 to-blue-600" />
          <p className="text-[9px] font-semibold tracking-[0.22em] text-indigo-400 uppercase">02 · HARNESS</p>
          <h4 className="mt-2 text-sm font-semibold text-zinc-100">파이프라인 관제</h4>
          <p className="text-[10px] text-indigo-400/70 mb-3">Orchestrator</p>
          <ul className="space-y-1.5 mt-auto">
            {["스케줄러 / 오토파일럿", "승인 게이트", "MCP Server", "WebSocket 관제"].map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-indigo-500 opacity-70" aria-hidden />
                <span className="font-mono text-[11px] leading-relaxed text-zinc-400">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <ArrowSvg />

        {/* Stage 3: AI Processing */}
        <Reveal delay={200} className="relative flex flex-col rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/8 p-5 w-[160px] flex-none">
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-fuchsia-500 to-pink-600" />
          <p className="text-[9px] font-semibold tracking-[0.22em] text-fuchsia-400 uppercase">03 · AI ENGINE</p>
          <h4 className="mt-2 text-sm font-semibold text-zinc-100">AI 처리</h4>
          <p className="text-[10px] text-fuchsia-400/70 mb-3">Task Routing</p>
          <ul className="space-y-1.5 mt-auto">
            {["작업 유형별 라우팅", "비용·품질 최적화", "병렬 처리"].map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-fuchsia-500 opacity-70" aria-hidden />
                <span className="font-mono text-[11px] leading-relaxed text-zinc-400">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <ArrowSvg />

        {/* Stage 4: Skill Engine */}
        <Reveal delay={300} className="relative flex flex-col rounded-2xl border border-blue-500/30 bg-blue-500/8 p-5 w-[160px] flex-none">
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-500 to-cyan-600" />
          <p className="text-[9px] font-semibold tracking-[0.22em] text-blue-400 uppercase">04 · SKILLS</p>
          <h4 className="mt-2 text-sm font-semibold text-zinc-100">스킬 실행</h4>
          <p className="text-[10px] text-blue-400/70 mb-3">Skill Engine</p>
          <ul className="space-y-1.5 mt-auto">
            {["자동 개발", "워크플로우 실행", "자동 테스트", "35+ 자동화 스킬"].map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-blue-500 opacity-70" aria-hidden />
                <span className="font-mono text-[11px] leading-relaxed text-zinc-400">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <ArrowSvg />

        {/* Stage 5: Output */}
        <Reveal delay={400} className="relative flex flex-col rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-5 w-[160px] flex-none">
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-emerald-500 to-teal-600" />
          <p className="text-[9px] font-semibold tracking-[0.22em] text-emerald-400 uppercase">05 · OUTPUT</p>
          <h4 className="mt-2 text-sm font-semibold text-zinc-100">산출물</h4>
          <p className="text-[10px] text-emerald-400/70 mb-3">Deploy &amp; Report</p>
          <ul className="space-y-1.5 mt-auto">
            {["Pull Request", "이슈 업데이트", "보고서 자동생성"].map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-emerald-500 opacity-70" aria-hidden />
                <span className="font-mono text-[11px] leading-relaxed text-zinc-400">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

      </div>
    </div>
  );
}
