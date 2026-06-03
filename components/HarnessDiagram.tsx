import Reveal from "@/components/Reveal";

type Stage = {
  step: string;
  label: string;
  title: string;
  subtitle: string;
  items: string[];
};

const stageColors = [
  {
    border: "border-violet-500/30",
    bg: "bg-violet-500/8",
    bar: "from-violet-500 to-purple-600",
    eyebrow: "text-violet-400",
    sub: "text-violet-400/70",
    dot: "bg-violet-500",
  },
  {
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/8",
    bar: "from-indigo-500 to-blue-600",
    eyebrow: "text-indigo-400",
    sub: "text-indigo-400/70",
    dot: "bg-indigo-500",
  },
  {
    border: "border-fuchsia-500/30",
    bg: "bg-fuchsia-500/8",
    bar: "from-fuchsia-500 to-pink-600",
    eyebrow: "text-fuchsia-400",
    sub: "text-fuchsia-400/70",
    dot: "bg-fuchsia-500",
  },
  {
    border: "border-blue-500/30",
    bg: "bg-blue-500/8",
    bar: "from-blue-500 to-cyan-600",
    eyebrow: "text-blue-400",
    sub: "text-blue-400/70",
    dot: "bg-blue-500",
  },
  {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/8",
    bar: "from-emerald-500 to-teal-600",
    eyebrow: "text-emerald-400",
    sub: "text-emerald-400/70",
    dot: "bg-emerald-500",
  },
];

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

export default function HarnessDiagram({ stages }: { stages: Stage[] }) {
  return (
    <div className="overflow-x-auto pb-4 -mx-2 px-2">
      <div className="flex items-start min-w-[860px] gap-0">
        {stages.map((stage, i) => {
          const c = stageColors[i] ?? stageColors[0];
          return (
            <div key={stage.step} className="contents">
              {i > 0 && <ArrowSvg />}
              <Reveal
                delay={i * 100}
                className={`relative flex flex-col rounded-2xl border ${c.border} ${c.bg} p-5 w-[160px] flex-none`}
              >
                <span aria-hidden className={`absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r ${c.bar}`} />
                <p className={`text-[9px] font-semibold tracking-[0.22em] ${c.eyebrow} uppercase`}>
                  {stage.step} · {stage.label}
                </p>
                <h4 className="mt-2 text-sm font-semibold text-zinc-100">{stage.title}</h4>
                <p className={`text-[10px] ${c.sub} mb-3`}>{stage.subtitle}</p>
                <ul className="space-y-1.5 mt-auto">
                  {stage.items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className={`mt-1.5 inline-block h-1 w-1 flex-none rounded-full ${c.dot} opacity-70`} aria-hidden />
                      <span className="font-mono text-[11px] leading-relaxed text-zinc-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          );
        })}
      </div>
    </div>
  );
}
