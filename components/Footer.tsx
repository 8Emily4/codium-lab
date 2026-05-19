import Link from "next/link";
import { company } from "@/lib/brand";

const footerLinks = [
  {
    heading: "Codium Lab",
    items: [
      { href: "/about", label: "소개" },
      { href: "/contact", label: "문의 · 제휴" },
    ],
  },
  {
    heading: "Services",
    items: [
      { href: "/services/adium", label: "Adium · AI 교육" },
      { href: "/services/badium", label: "Badium · 디자인" },
    ],
  },
  {
    heading: "Resources",
    items: [
      { href: "/academy", label: "수강 신청" },
      { href: "/archive", label: "아카이브 · 블로그" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
                CL
              </span>
              <span>{company.nameKo}</span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              AI 마스터가 이끄는 트렌디한 디지털 비즈니스. 연구와 디자인의 두
              바퀴를 굴립니다.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.heading}>
              <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase dark:text-zinc-400">
                {group.heading}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-zinc-200 pt-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:text-zinc-400">
          <p>
            © {new Date().getFullYear()} {company.nameKo} ({company.nameEn}) ·
            대표 {company.ceo}
          </p>
          <p>
            {company.location} ·{" "}
            <a
              href={`mailto:${company.contactEmail}`}
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {company.contactEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
