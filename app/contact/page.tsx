import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import InquiryForm from "@/components/InquiryForm";
import { company, contactPage } from "@/lib/brand";

export const metadata: Metadata = {
  title: `문의 · ${company.nameKo}`,
  description: "코디움랩 · 컨설팅·협업 문의. 초기 진단 미팅은 무료입니다.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow={contactPage.eyebrow}
        title={contactPage.title}
        highlight={contactPage.highlight}
        description={contactPage.description}
      />

      <section className="relative border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
            <Reveal direction="left">
              <div className="lg:sticky lg:top-24">
                <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                  Channels
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
                  어떻게 닿을 수 있나
                </h2>

                <dl className="mt-8 space-y-6 text-sm">
                  {contactPage.channels.map((c) => {
                    const href = "href" in c ? c.href : undefined;
                    return (
                      <div key={c.label}>
                        <dt className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase dark:text-zinc-400">
                          {c.label}
                        </dt>
                        <dd className="mt-1.5">
                          {href ? (
                            <a
                              href={href}
                              className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
                            >
                              {c.value}
                            </a>
                          ) : (
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                              {c.value}
                            </span>
                          )}
                        </dd>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {c.hint}
                        </p>
                      </div>
                    );
                  })}
                </dl>

                <div className="mt-10">
                  <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase dark:text-zinc-400">
                    협업 시작
                  </p>
                  <ol className="mt-3 space-y-3">
                    {contactPage.steps.map((s) => (
                      <li key={s.step} className="flex items-start gap-3">
                        <span className="text-gradient mt-0.5 text-sm font-bold tracking-tight">
                          {s.step}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {s.title}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {s.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150} direction="right">
              <InquiryForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
