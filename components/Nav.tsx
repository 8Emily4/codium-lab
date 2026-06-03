import Link from "next/link";
import { company } from "@/lib/brand";
import { getSession } from "@/lib/auth";
import NavLinks from "./NavLinks";
import SessionMenu from "./auth/SessionMenu";
import Logo from "./Logo";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export default async function Nav({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-black/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={`/${lang}`}
          className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          <Logo className="h-7 w-7 shrink-0" />
          <span className="whitespace-nowrap">{lang === "en" ? company.nameEn : company.nameKo}</span>
        </Link>

        <NavLinks session={session} lang={lang} dict={dict} />
      </div>
    </header>
  );
}

export { SessionMenu };
