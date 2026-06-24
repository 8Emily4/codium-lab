"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

type ThemeContextValue = {
  /** 사용자가 선택한 테마(시스템 포함). */
  theme: Theme;
  /** system 을 실제 라이트/다크로 해석한 값. */
  resolvedTheme: Resolved;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** <html> 에 .dark 클래스와 color-scheme 을 적용하고 해석된 테마를 반환. */
function applyTheme(theme: Theme): Resolved {
  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark());
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  return isDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // SSR 및 첫 하이드레이션은 항상 system 으로 시작 → 인라인 스크립트가 이미
  // <html> 에 올바른 클래스를 적용해 두므로 화면 깜빡임은 없음.
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<Resolved>("light");

  // 마운트 시 저장된 선택값을 읽어 상태를 맞춘다(스크립트가 이미 DOM 은 적용함).
  // SSR/하이드레이션은 항상 "system" 이어야 마크업이 일치하므로, localStorage
  // 동기화는 렌더가 아니라 마운트 후 effect 에서만 가능하다.
  useEffect(() => {
    let stored: Theme = "system";
    try {
      const v = localStorage.getItem(THEME_STORAGE_KEY);
      if (v === "light" || v === "dark" || v === "system") stored = v;
    } catch {
      /* localStorage 접근 불가(프라이빗 모드 등) — system 유지 */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 외부 저장소(localStorage)→React 1회 동기화
    setThemeState(stored);
    setResolvedTheme(applyTheme(stored));
  }, []);

  // system 모드일 때 OS 설정 변경에 실시간 반응.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(applyTheme("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* 저장 실패는 무시 — 세션 내 토글은 동작 */
    }
    setThemeState(next);
    setResolvedTheme(applyTheme(next));
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

/**
 * <html> 에 주입되는 동기 스크립트. 첫 페인트 이전에 저장된 테마를 적용해
 * 라이트↔다크 깜빡임(FOUC)을 방지한다. 키/로직은 위 ThemeProvider 와 동일.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(_){}})();`;
