import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  highlight,
  description,
  cta,
}: {
  eyebrow: string;
  title: ReactNode;
  highlight?: ReactNode;
  description: string;
  cta?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black">
      <div className="bg-mesh absolute inset-0 opacity-90" aria-hidden />
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
      <div className="bg-noise" aria-hidden />
      <div
        className="anim-float pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/30 to-fuchsia-400/20 blur-3xl dark:from-indigo-500/20 dark:to-fuchsia-500/10"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:py-28">
        <p className="text-sm font-medium tracking-[0.22em] text-indigo-600 uppercase dark:text-indigo-400">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
          {title}
          {highlight && (
            <>
              {" "}
              <span className="text-gradient">{highlight}</span>
            </>
          )}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300">
          {description}
        </p>
        {cta && <div className="mt-10 flex flex-wrap items-center gap-3">{cta}</div>}
      </div>
    </section>
  );
}
