"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { courses, type Course } from "@/lib/brand";

type Filter = "all" | "adium" | "badium";

const filters: { id: Filter; label: string; sub: string }[] = [
  { id: "all", label: "ALL", sub: "전체" },
  { id: "adium", label: "ADIUM", sub: "AI · 디지털 교육" },
  { id: "badium", label: "BADIUM", sub: "디자인 · 굿즈" },
];

const brandAccent: Record<Course["brand"], string> = {
  adium: "from-indigo-500 to-violet-500",
  badium: "from-fuchsia-500 to-rose-500",
};

const brandLabel: Record<Course["brand"], string> = {
  adium: "Adium",
  badium: "Badium",
};

const brandChip: Record<Course["brand"], string> = {
  adium:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  badium:
    "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
};

export default function AcademyBrowser() {
  const [filter, setFilter] = useState<Filter>("all");
  const [cart, setCart] = useState<string[]>([]);

  const visible = useMemo(
    () => (filter === "all" ? courses : courses.filter((c) => c.brand === filter)),
    [filter],
  );

  function toggleCart(id: string) {
    setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  return (
    <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`flex items-baseline gap-2 rounded-full px-5 py-2 font-medium tracking-[0.18em] uppercase transition ${
                  filter === f.id
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                }`}
              >
                <span>{f.label}</span>
                <span className="hidden text-[10px] font-normal tracking-normal opacity-70 sm:inline normal-case">
                  {f.sub}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
              {cart.length}
            </span>
            장바구니에 담긴 과정
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => {
            const inCart = cart.includes(c.id);
            return (
              <article
                key={c.id}
                id={c.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${brandAccent[c.brand]}`} />
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${brandChip[c.brand]}`}
                    >
                      {brandLabel[c.brand]}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {c.level}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    {c.subtitle}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {c.description}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {c.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-end justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800">
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {c.duration}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {c.price}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCart(c.id)}
                      className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition ${
                        inCart
                          ? "border border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                          : `bg-gradient-to-r ${brandAccent[c.brand]} text-white`
                      }`}
                    >
                      {inCart ? "담김 ✓" : "장바구니"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {cart.length > 0 && (
          <div className="sticky bottom-4 z-10 mt-10 flex flex-col items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/90 p-5 backdrop-blur sm:flex-row sm:items-center dark:border-zinc-700 dark:bg-zinc-900/90">
            <p className="text-sm text-zinc-700 dark:text-zinc-200">
              <span className="font-semibold">{cart.length}개 과정</span>이
              장바구니에 담겼습니다. 코디움랩 통합 결제로 한 번에 결제하세요.
            </p>
            <Link
              href="/contact?intent=enroll"
              className="inline-flex h-11 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              결제 진행 →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
