import Reveal from "./Reveal";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const icons: Record<string, React.ReactElement> = {
  Consulting: (
    <path d="M4 19V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12M4 19h16M8 11l3 3 5-5" />
  ),
  Engineering: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />,
  Education: (
    <path d="M3 9l9-5 9 5-9 5-9-5zM7 11v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5M21 9v5" />
  ),
  Studio: (
    <path d="M12 3l9 5v8l-9 5-9-5V8l9-5zM12 12l9-4M12 12L3 8M12 12v9" />
  ),
};

export default function Services({ dict }: { dict: Dictionary }) {
  const { servicesSection } = dict;

  return (
    <section
      id="services"
      className="relative overflow-hidden border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950"
    >
      <div className="bg-dots absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <Reveal>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              {servicesSection.eyebrow}
            </p>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              {servicesSection.title}{" "}
              <span className="text-gradient">{servicesSection.titleHighlight}</span>
            </h2>
            <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
              {servicesSection.desc}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {servicesSection.items.map((svc, i) => (
            <Reveal
              key={svc.title}
              delay={i * 100}
              as="article"
              className="group card-elevate relative flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-7 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.45)] dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 ring-1 ring-indigo-100 transition group-hover:from-indigo-100 group-hover:to-violet-100 dark:from-indigo-500/10 dark:to-violet-500/10 dark:text-indigo-300 dark:ring-indigo-500/20">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    {icons[svc.tag]}
                  </svg>
                </span>
                <span className="text-[10px] font-semibold tracking-[0.22em] text-zinc-400 uppercase dark:text-zinc-500">
                  {svc.tag}
                </span>
              </div>

              <h3 className="mt-6 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {svc.title}
              </h3>
              <p className="mt-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {svc.summary}
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {svc.body}
              </p>

              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-7 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 transition group-hover:opacity-100"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
