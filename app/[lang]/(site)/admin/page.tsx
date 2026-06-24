import { redirect } from "next/navigation";

// 사용자 관리는 워크스페이스(/work/admin/users)로 이전되었습니다.
export default async function LegacyAdminRedirect({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/work/admin/users`);
}
