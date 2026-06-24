import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { hasLocale } from "../dictionaries";
import { getSessionWithRole } from "@/lib/users";
import { countNewInquiries } from "@/lib/inquiries";
import WorkspaceShell from "@/components/work/WorkspaceShell";

export const metadata: Metadata = {
  title: "워크스페이스",
  robots: { index: false, follow: false },
};

export default async function WorkLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const ctx = await getSessionWithRole();
  if (!ctx) {
    redirect(`/${lang}/login?returnTo=${encodeURIComponent(`/${lang}/work`)}`);
  }

  const { session, role } = ctx;
  const isAdmin = role === "admin" || role === "superAdmin";
  const newInquiryCount = isAdmin ? await countNewInquiries() : 0;
  return (
    <WorkspaceShell
      lang={lang}
      role={role}
      newInquiryCount={newInquiryCount}
      user={{
        id: session.id,
        name: session.name,
        email: session.email,
        avatar: session.avatar,
      }}
    >
      {children}
    </WorkspaceShell>
  );
}
