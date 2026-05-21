import { company } from "@/lib/brand";
import Reveal from "./Reveal";

export default function Stats() {
  return (
    <section className="relative border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-200/60 sm:grid-cols-4 dark:border-zinc-800/80 dark:bg-zinc-800/60">
            {company.stats.map((s, i) => (
              <Reveal
                key={s.label}
                delay={i * 80}
                direction="scale"
                className="group relative flex flex-col gap-2 bg-white p-6 transition hover:bg-zinc-50 sm:p-7 dark:bg-zinc-950 dark:hover:bg-zinc-900/60"
              >
                <dt className="text-xs font-medium tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
                  {s.label}
                </dt>
                <dd className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
                  {s.value}
                </dd>
                <span
                  aria-hidden
                  className="absolute bottom-0 left-6 right-6 h-px origin-left scale-x-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-transform duration-500 group-hover:scale-x-100"
                />
              </Reveal>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
