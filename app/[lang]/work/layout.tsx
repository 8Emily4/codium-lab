import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { hasLocale } from "../dictionaries";
import { getSessionWithRole } from "@/lib/users";
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
  return (
    <WorkspaceShell
      lang={lang}
      role={role}
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
