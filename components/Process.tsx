import Reveal from "./Reveal";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export default function Process({ dict }: { dict: Dictionary }) {
  const { processSection } = dict;

  return (
    <section
      id="process"
      className="relative overflow-hidden border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black"
    >
      <div className="bg-grid absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <Reveal>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              {processSection.eyebrow}
            </p>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              {processSection.title}{" "}
              <span className="text-gradient">{processSection.titleHighlight}</span>
            </h2>
            <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
              {processSection.desc}
            </p>
          </div>
        </Reveal>

        <ol className="relative mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-200/60 lg:grid-cols-4 dark:border-zinc-800/80 dark:bg-zinc-800/60">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[88px] hidden h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent lg:block"
          />

          {processSection.items.map((p, i) => (
            <Reveal
              key={p.step}
              as="li"
              delay={i * 120}
              direction="up"
              className="relative flex flex-col gap-3 bg-white p-7 transition hover:bg-zinc-50 sm:p-9 dark:bg-zinc-950 dark:hover:bg-zinc-900/60"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-gradient text-4xl font-bold tracking-tight">
                  {p.step}
                </span>
                <span className="text-xs font-medium tracking-[0.22em] text-zinc-400 uppercase dark:text-zinc-500">
                  step {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {p.title}
              </h3>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {p.body}
              </p>

              <span
                aria-hidden
                className="absolute top-[84px] left-7 hidden h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 ring-4 ring-white lg:block dark:ring-zinc-950"
              />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
