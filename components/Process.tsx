import { company } from "@/lib/brand";

export default function Process() {
  return (
    <section
      id="process"
      className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Process
          </p>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            발견에서 이관까지, 네 단계로 일합니다
          </h2>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
            짧고 분명한 단계로 나누어, 어느 시점에 무엇이 결정되는지 함께 보이게 합니다.
          </p>
        </div>

        <ol className="relative mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-800">
          {company.process.map((p, i) => (
            <li
              key={p.step}
              className="relative flex flex-col gap-3 bg-white p-7 sm:p-8 dark:bg-zinc-950"
            >
              <div className="flex items-baseline gap-3">
                <span className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
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
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
