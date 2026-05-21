"use client";

import { useEffect, useState } from "react";

type CodeSnippet = { file: string; lang: string; lines: string[] };

const CODE_SNIPPETS: CodeSnippet[] = [
  {
    file: "codium-lab/automation/workflow.ts",
    lang: "ts",
    lines: [
      "import { claude } from '@anthropic-ai/sdk'",
      "",
      "export async function automate(ctx: Workflow) {",
      "  const intent = await discover(ctx.team)",
      "  const plan = await claude.messages.create({",
      "    model: 'claude-opus-4-7',",
      "    messages: [{ role: 'user', content: intent }],",
      "  })",
      "  return { ok: true, plan }",
      "}",
    ],
  },
  {
    file: "adium/curriculum.py",
    lang: "py",
    lines: [
      "async def design_track(audience: str):",
      "    persona = await profile.read(audience)",
      "    track = await llm.synthesize(",
      "        goal='AI 리터러시',",
      "        persona=persona,",
      "    )",
      "    return track.adapt(level='executive')",
    ],
  },
  {
    file: "badium/design-pipeline.ts",
    lang: "ts",
    lines: [
      "export async function craft(brief: Brief) {",
      "  const palette = await ai.style(brief.mood)",
      "  const illust = await diffusion.render({",
      "    prompt: brief.story,",
      "    palette,",
      "  })",
      "  return goods.compose(illust)",
      "}",
    ],
  },
  {
    file: "mcp/server.py",
    lang: "py",
    lines: [
      "@mcp.tool()",
      "async def add_context(jira_key: str):",
      "    issue = await client.get_issue(jira_key)",
      "    sessions = await client.get_sessions(issue.id)",
      "    return format_context(issue, sessions)",
    ],
  },
];

export default function CodeTyper({
  position,
  startIdx = 0,
}: {
  position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  startIdx?: number;
}) {
  const [snippetIdx, setSnippetIdx] = useState(startIdx % CODE_SNIPPETS.length);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [caretBlink, setCaretBlink] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setCaretBlink((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const snippet = CODE_SNIPPETS[snippetIdx];
    if (lineIdx >= snippet.lines.length) {
      const t = setTimeout(() => {
        setSnippetIdx((idx) => (idx + 1) % CODE_SNIPPETS.length);
        setLineIdx(0);
        setCharIdx(0);
      }, 1800);
      return () => clearTimeout(t);
    }
    const line = snippet.lines[lineIdx];
    if (charIdx < line.length) {
      const speed = 25 + Math.random() * 35;
      const t = setTimeout(() => setCharIdx((c) => c + 1), speed);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLineIdx((l) => l + 1);
      setCharIdx(0);
    }, 110);
    return () => clearTimeout(t);
  }, [snippetIdx, lineIdx, charIdx]);

  const snippet = CODE_SNIPPETS[snippetIdx];
  const completedLines = snippet.lines.slice(0, lineIdx);
  const currentLine =
    lineIdx < snippet.lines.length ? snippet.lines[lineIdx].slice(0, charIdx) : null;

  const posMap: Record<typeof position, string> = {
    topLeft: "top-6 left-6 hidden lg:block",
    topRight: "top-6 right-6 hidden lg:block",
    bottomLeft: "bottom-6 left-6 hidden lg:block",
    bottomRight: "bottom-6 right-6 hidden lg:block",
  };
  const posCls = posMap[position];

  return (
    <div className={`absolute ${posCls} z-0 w-[380px] pointer-events-none`}>
      <div className="rounded-xl bg-white/40 ring-1 ring-zinc-200/60 shadow-[0_24px_60px_-30px_rgba(99,102,241,0.35)] backdrop-blur-xl dark:bg-zinc-900/40 dark:ring-white/5">
        <div className="flex items-center gap-1.5 border-b border-zinc-200/60 px-3 py-1.5 dark:border-white/5">
          <span className="h-2 w-2 rounded-full bg-red-400/70" />
          <span className="h-2 w-2 rounded-full bg-amber-400/70" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
          <span className="ml-2 truncate font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
            {snippet.file}
          </span>
        </div>
        <pre className="min-h-[160px] max-h-[200px] overflow-hidden whitespace-pre px-3 py-2 font-mono text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-200">
          {completedLines.map((ln, i) => (
            <div key={`done-${i}`}>{ln || " "}</div>
          ))}
          {currentLine !== null && (
            <div>
              {currentLine}
              <span className="text-indigo-500 dark:text-indigo-300">
                {caretBlink ? "▌" : " "}
              </span>
            </div>
          )}
        </pre>
      </div>
    </div>
  );
}
