"use client";

const FLOATING_TOKENS_KO: string[] = [
  "Codium Lab",
  "코디움랩",
  "Adium",
  "Badium",
  "에이디움",
  "베이디움",
  "// 본질에서 출발",
  "// 도구가 사람을 끌어올린다",
  "// 일상까지 닿는 가치",
  "automate(workflow)",
  "consult(client)",
  "design.literacy",
  "studio.craft",
  "research → ship",
  "PoC → 운영",
  "디스커버리 · 설계 · 구현 · 이관",
  "워크플로 진단",
  "LLM 컨설팅",
  "AI 리터러시",
  "디지털 굿즈",
]

const FLOATING_TOKENS_EN: string[] = [
  "Codium Lab",
  "Adium",
  "Badium",
  "// start from essence",
  "// tools elevate people",
  "// value that reaches daily life",
  "automate(workflow)",
  "consult(client)",
  "design.literacy",
  "studio.craft",
  "research → ship",
  "PoC → production",
  "discover · design · build · transfer",
  "workflow diagnosis",
  "LLM consulting",
  "AI literacy",
  "digital goods",
]

const FLOATING_TOKENS_SHARED: string[] = [

  "const ctx = await load()",
  "export default Skill",
  "await llm.generate()",
  "await agent.run()",
  "pipeline.dispatch",
  "workflow.automate()",
  "ctx.embed(doc)",
  "retrieve(query)",
  "vector.search()",
  "rag.synthesize()",
  "// secure by default",
  "if (humanInLoop)",
  "stream: true",
  "tools: [...]",
  "→ next stage",
  "{ status: \"shipped\" }",
  "✓ verified",
  "Promise.all([...])",
  "→ deploy",
  "0x4af2",

  // AI 모델
  "claude",
  "gpt-4o",
  "gemini",
  "opus-4-7",
  "sonnet-4-6",
  "haiku-4-5",
  "claude-code",
  "cursor",
  "deepseek",
  "qwen",
  "llama-3",

  // 키워드
  "LLM",
  "RAG",
  "MCP",
  "Agent",
  "Workflow",
  "Embedding",
  "Vector DB",
  "Prompt",
  "Pipeline",
  "Inference",
];

function getTokens(lang: string): string[] {
  const locale = lang === 'en' ? FLOATING_TOKENS_EN : FLOATING_TOKENS_KO;
  return [...locale, ...FLOATING_TOKENS_SHARED];
}

function tokenStyle(idx: number, token: string): string {
  const isModel =
    /claude|gpt|gemini|opus|sonnet|haiku|cursor|deepseek|qwen|llama/i.test(token);
  const isDomain =
    /(코디움랩|에이디움|베이디움|Codium|Adium|Badium|LLM|RAG|MCP|Agent|Workflow|Vector|Embedding|Prompt|Pipeline|Inference)/i.test(
      token,
    );
  const isComment = token.trim().startsWith("//");

  if (isComment) {
    return "text-emerald-500/55 dark:text-emerald-300/45 italic";
  }
  if (isModel) {
    return "text-violet-500/70 dark:text-violet-300/55 font-semibold";
  }
  if (isDomain) {
    return "text-indigo-500/65 dark:text-indigo-300/55 font-medium";
  }
  if (idx % 4 === 0) {
    return "text-fuchsia-500/55 dark:text-fuchsia-300/45";
  }
  return "text-zinc-500/70 dark:text-zinc-300/40";
}

export default function FloatingTokens({
  density = "normal",
  mask = "fade",
  className = "",
  lang = "ko",
}: {
  density?: "light" | "normal" | "dense";
  mask?: "none" | "fade" | "right-half";
  className?: string;
  lang?: string;
}) {
  const sliceMap = { light: 22, normal: 40, dense: 64 } as const;
  const tokens = getTokens(lang).slice(0, sliceMap[density]);

  const maskStyle =
    mask === "fade"
      ? {
          maskImage:
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 0%, transparent 30%, black 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 0%, transparent 30%, black 75%)",
        }
      : mask === "right-half"
        ? {
            maskImage:
              "linear-gradient(to right, transparent 0%, transparent 42%, black 62%, black 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, transparent 42%, black 62%, black 100%)",
          }
        : undefined;

  return (
    <div
      aria-hidden
      style={maskStyle}
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {tokens.map((token, i) => {
        const top = (i * 13 + 7) % 95;
        const left = (i * 37 + 11) % 95;
        const duration = 22 + (i % 9) * 2;
        const delay = -((i * 1.7) % 18);
        const size = 13 + (i % 5) * 2;
        const direction = i % 4;
        const animName =
          direction === 0
            ? "driftA"
            : direction === 1
              ? "driftB"
              : direction === 2
                ? "driftC"
                : "driftD";

        return (
          <span
            key={`${token}-${i}`}
            className={`absolute font-mono whitespace-nowrap tracking-tight ${tokenStyle(i, token)}`}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              fontSize: `${size}px`,
              animation: `${animName} ${duration}s ease-in-out ${delay}s infinite`,
              opacity: 0,
            }}
          >
            {token}
          </span>
        );
      })}
    </div>
  );
}
