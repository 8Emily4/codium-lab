import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import Process from "@/components/Process";
import BrandCard from "@/components/BrandCard";
import FAQ from "@/components/FAQ";
import InquiryForm from "@/components/InquiryForm";
import { company, subBrands } from "@/lib/brand";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />

      <section
        id="brands"
        className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              Brands
            </p>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              {company.nameKo}이 운영하는 두 개의 브랜드
            </h2>
            <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
              교육과 디자인, 두 결의 브랜드가 코디움랩의 연구를 일상으로 옮깁니다.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {subBrands.map((brand) => (
              <BrandCard key={brand.slug} brand={brand} />
            ))}
          </div>
        </div>
      </section>

      <Services />
      <Process />

      <section
        id="philosophy"
        className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
              Philosophy
            </p>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              코디움랩이 일하는 방식
            </h2>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {company.philosophy.map((item, idx) => (
              <li
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
              >
                <p className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                  0{idx + 1}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FAQ />

      <section id="contact" className="bg-white dark:bg-black">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <p className="text-sm font-medium tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Contact
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            컨설팅 · 협업 문의
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">
            B2B 기술 컨설팅, 공동 R&amp;D, 강의·콘텐츠 협업 등 어떤 형태든 편하게
            문의 주세요. 접수된 내용은{" "}
            <a
              href={`mailto:${company.contactEmail}`}
              className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
            >
              {company.contactEmail}
            </a>
            로도 확인할 수 있습니다.
          </p>
          <div className="mt-10">
            <InquiryForm />
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
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
