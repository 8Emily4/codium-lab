import type { Metadata } from "next";
import { company } from "@/lib/brand";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "코디움랩 협업 자주 묻는 질문 — 협업 일반·보안·일정·운영·이관.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: `FAQ · ${company.nameKo}`,
    description:
      "코디움랩 협업 자주 묻는 질문 — 협업 일반·보안·일정·운영·이관.",
    url: "/faq",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
