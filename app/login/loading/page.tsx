import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginTransition from "@/components/auth/LoginTransition";

export const metadata: Metadata = {
  title: "로그인 중…",
};

export default async function LoginLoadingPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const returnTo = params.returnTo ?? "/";

  return <LoginTransition user={session} returnTo={returnTo} />;
}
