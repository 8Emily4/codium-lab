import { redirect } from "next/navigation";

// Content management was consolidated into the workspace.
export default async function LegacyAdminMediaRedirect({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/work/admin/content`);
}
