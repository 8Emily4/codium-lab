import { company } from "@/lib/brand";

export default function Stats() {
  return (
    <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-800">
          {company.stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-2 bg-white p-6 sm:p-7 dark:bg-zinc-950"
            >
              <dt className="text-xs font-medium tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
                {s.label}
              </dt>
              <dd className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
