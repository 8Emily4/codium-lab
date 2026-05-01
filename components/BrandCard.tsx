import type { SubBrand } from "@/lib/brand";

export default function BrandCard({ brand }: { brand: SubBrand }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.35)] dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600">
      <div className={`h-1.5 w-full bg-gradient-to-r ${brand.accent}`} aria-hidden />
      <div className="flex flex-1 flex-col p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-zinc-500 uppercase">
              {brand.nameEn}
            </p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {brand.nameKo}
            </h3>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
            {brand.tagline}
          </span>
        </div>

        <p className="mt-5 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
          {brand.description}
        </p>

        <ul className="mt-6 grid grid-cols-1 gap-2 text-sm text-zinc-600 sm:grid-cols-1 dark:text-zinc-300">
          {brand.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2.5">
              <span
                aria-hidden
                className={`mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-br ${brand.accent}`}
              />
              {h}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          {brand.href ? (
            <a
              href={brand.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
            >
              자세히 보기
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              사이트 준비 중
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
