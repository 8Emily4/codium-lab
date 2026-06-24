"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

/**
 * 클라이언트에서 Mermaid 다이어그램을 렌더링합니다.
 * - <html>.dark 클래스(테마 토글 결과)에 맞춰 라이트/다크 테마를 자동 전환
 * - 코디움랩 팔레트(인디고/바이올렛/푸시아)에 맞춘 themeVariables
 * - 렌더 실패 시 원본 소스를 코드 블록으로 폴백 노출
 */

function subscribeDark(cb: () => void): () => void {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => obs.disconnect();
}

function useDarkMode(): boolean {
  return useSyncExternalStore(
    subscribeDark,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

const FONT =
  'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

function themeVars(dark: boolean) {
  if (dark) {
    return {
      darkMode: true,
      fontFamily: FONT,
      fontSize: "14px",
      background: "transparent",
      primaryColor: "#1e1b4b",
      primaryBorderColor: "#818cf8",
      primaryTextColor: "#e0e7ff",
      secondaryColor: "#3b0764",
      secondaryBorderColor: "#c084fc",
      secondaryTextColor: "#f5d0fe",
      tertiaryColor: "#0c0c14",
      tertiaryBorderColor: "#3f3f46",
      tertiaryTextColor: "#d4d4d8",
      lineColor: "#6366f1",
      textColor: "#e4e4e7",
      mainBkg: "#1e1b4b",
      nodeBorder: "#818cf8",
      clusterBkg: "rgba(99,102,241,0.06)",
      clusterBorder: "#3f3f46",
      titleColor: "#e0e7ff",
      edgeLabelBackground: "#0c0c14",
      // ER diagram
      attributeBackgroundColorOdd: "#0e0e16",
      attributeBackgroundColorEven: "#14141d",
      // sequence
      actorBkg: "#1e1b4b",
      actorBorder: "#818cf8",
      actorTextColor: "#e0e7ff",
      signalColor: "#a5b4fc",
      signalTextColor: "#c7d2fe",
      labelBoxBkgColor: "#1e1b4b",
      labelBoxBorderColor: "#818cf8",
      labelTextColor: "#e0e7ff",
      noteBkgColor: "#3b0764",
      noteBorderColor: "#c084fc",
      noteTextColor: "#f5d0fe",
      activationBkgColor: "#312e81",
    };
  }
  return {
    darkMode: false,
    fontFamily: FONT,
    fontSize: "14px",
    background: "transparent",
    primaryColor: "#eef2ff",
    primaryBorderColor: "#6366f1",
    primaryTextColor: "#312e81",
    secondaryColor: "#fdf4ff",
    secondaryBorderColor: "#d946ef",
    secondaryTextColor: "#86198f",
    tertiaryColor: "#f8fafc",
    tertiaryBorderColor: "#cbd5e1",
    tertiaryTextColor: "#334155",
    lineColor: "#818cf8",
    textColor: "#3f3f46",
    mainBkg: "#eef2ff",
    nodeBorder: "#6366f1",
    clusterBkg: "rgba(99,102,241,0.04)",
    clusterBorder: "#e2e8f0",
    titleColor: "#312e81",
    edgeLabelBackground: "#ffffff",
    attributeBackgroundColorOdd: "#ffffff",
    attributeBackgroundColorEven: "#f8fafc",
    actorBkg: "#eef2ff",
    actorBorder: "#6366f1",
    actorTextColor: "#312e81",
    signalColor: "#6366f1",
    signalTextColor: "#4338ca",
    labelBoxBkgColor: "#eef2ff",
    labelBoxBorderColor: "#6366f1",
    labelTextColor: "#312e81",
    noteBkgColor: "#fdf4ff",
    noteBorderColor: "#d946ef",
    noteTextColor: "#86198f",
    activationBkgColor: "#e0e7ff",
  };
}

export default function Mermaid({ chart }: { chart: string }) {
  const rawId = useId();
  const id = "mmd-" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const dark = useDarkMode();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: themeVars(dark),
          flowchart: { curve: "basis", htmlLabels: true, padding: 14 },
          er: { useMaxWidth: true },
          sequence: { useMaxWidth: true, mirrorActors: false },
        });
        const { svg } = await mermaid.render(id + "-svg", chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          const el = ref.current.querySelector("svg");
          if (el) {
            el.removeAttribute("height");
            el.style.maxWidth = "100%";
            el.style.height = "auto";
          }
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, dark, id]);

  if (error) {
    return (
      <pre className="overflow-auto rounded-xl bg-zinc-900 p-4 text-xs text-rose-300">
        다이어그램 렌더링 오류: {error}
        {"\n\n"}
        {chart}
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className="mermaid-host flex min-h-[200px] w-full items-center justify-center overflow-x-auto py-2 [&_svg]:mx-auto"
      aria-label="아키텍처 다이어그램"
    />
  );
}
