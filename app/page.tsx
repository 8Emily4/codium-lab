import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import Process from "@/components/Process";
import BrandCard from "@/components/BrandCard";
import FAQ from "@/components/FAQ";
import InquiryForm from "@/components/InquiryForm";
import Reveal from "@/components/Reveal";
import { company, subBrands } from "@/lib/brand";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />

      <section
        id="brands"
        className="relative overflow-hidden border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-black"
      >
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-300/30 to-fuchsia-300/20 blur-3xl dark:from-indigo-500/15 dark:to-fuchsia-500/10"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                Brands
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                {company.nameKo}이 운영하는{" "}
                <span className="text-gradient">두 개의 브랜드</span>
              </h2>
              <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
                교육과 디자인, 두 결의 브랜드가 코디움랩의 연구를 일상으로 옮깁니다.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {subBrands.map((brand, i) => (
              <Reveal
                key={brand.slug}
                delay={i * 160}
                direction={i === 0 ? "left" : "right"}
              >
                <BrandCard brand={brand} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Services />
      <Process />

      <section
        id="philosophy"
        className="relative overflow-hidden border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950"
      >
        <div className="bg-dots absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                Philosophy
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                코디움랩이 <span className="text-gradient">일하는 방식</span>
              </h2>
            </div>
          </Reveal>
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {company.philosophy.map((item, idx) => (
              <Reveal
                key={item.title}
                as="li"
                delay={idx * 140}
                direction="up"
                className="card-elevate rounded-2xl border border-zinc-200/80 bg-white p-7 hover:border-indigo-300 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.35)] dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
              >
                <p className="text-gradient text-3xl font-bold tracking-tight">
                  0{idx + 1}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <FAQ />

      <section id="contact" className="relative overflow-hidden bg-white dark:bg-black">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-300/20 to-fuchsia-300/20 blur-3xl dark:from-indigo-500/10 dark:to-fuchsia-500/10"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
            <Reveal direction="left">
              <div className="lg:sticky lg:top-24">
                <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
                  Contact
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                  <span className="text-gradient">컨설팅 · 협업</span>
                  <br />
                  문의
                </h2>
                <p className="mt-5 text-zinc-600 dark:text-zinc-300">
                  B2B 기술 컨설팅, 공동 R&amp;D, 강의·콘텐츠 협업 등 어떤 형태든
                  편하게 문의 주세요.
                </p>
                <dl className="mt-8 space-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-medium tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
                      Email
                    </dt>
                    <dd className="mt-1.5">
                      <a
                        href={`mailto:${company.contactEmail}`}
                        className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
                      >
                        {company.contactEmail}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
                      Location
                    </dt>
                    <dd className="mt-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                      {company.location}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
                      회신 시간
                    </dt>
                    <dd className="mt-1.5 text-zinc-700 dark:text-zinc-300">
                      평일 기준 1–2영업일 내
                    </dd>
                  </div>
                </dl>
              </div>
            </Reveal>
            <Reveal delay={150} direction="right">
              <InquiryForm />
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[10px] font-bold text-white">
              CL
            </span>
            <p>
              © {new Date().getFullYear()} {company.nameKo} ({company.nameEn})
            </p>
          </div>
          <p>
            {company.location} · {company.contactEmail}
          </p>
        </div>
      </footer>
    </>
  );
}
