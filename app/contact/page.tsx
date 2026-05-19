import type { Metadata } from "next";
import { company } from "@/lib/brand";
import InquiryForm from "@/components/InquiryForm";

export const metadata: Metadata = {
  title: `Contact · 문의 | ${company.nameKo}`,
  description:
    "비즈니스 제휴, 외부 강의, 디자인 협업 — 코디움랩과의 협업 문의는 한 곳에서 받습니다.",
};

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="bg-mesh absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Contact
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            함께 만들고 싶은 것이 있다면,
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              어떤 결의 협업이든
            </span>{" "}
            받습니다.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300">
            비즈니스 제휴, 외부 강의, 디자인 협업까지. 코디움랩은 ‘에이디움 ·
            베이디움’ 두 브랜드의 문의를 한 창구에서 받습니다.
          </p>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Channels
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            세 가지 결의 문의 창구
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {company.contactChannels.map((c) => (
              <article
                key={c.label}
                className="rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="text-xs font-medium tracking-[0.22em] text-zinc-500 uppercase dark:text-zinc-400">
                  {c.label}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {c.label}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {c.body}
                </p>
                <a
                  href={`mailto:${c.email}`}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {c.email}
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
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white dark:bg-black">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Inquiry form
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            한 줄로 시작해도 좋아요
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">
            해결하고 싶은 문제, 기대하는 결과, 시점만 알려 주셔도 충분합니다.
            평일 기준 1–2영업일 안에{" "}
            <a
              href={`mailto:${company.contactEmail}`}
              className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
            >
              {company.contactEmail}
            </a>
            로 회신드립니다.
          </p>
          <div className="mt-10">
            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
