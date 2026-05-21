"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Direction = "up" | "scale" | "left" | "right";

export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
  as: As = "div",
  threshold = 0.08,
  once = true,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "header" | "ul" | "ol";
  threshold?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respect reduced motion
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.unobserve(el);
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  const dirClass = `reveal-${direction}`;

  return (
    <As
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal-init ${dirClass} ${shown ? "reveal-shown" : ""} ${className}`}
    >
      {children}
    </As>
  );
}

export function StaggerItem({
  index,
  children,
  direction = "up",
  className = "",
}: {
  index: number;
  children: ReactNode;
  direction?: Direction;
  className?: string;
}) {
  return (
    <Reveal direction={direction} delay={index * 100} className={className}>
      {children}
    </Reveal>
  );
}
