import Link from "next/link";
import { company } from "@/lib/brand";
import { getSession } from "@/lib/auth";
import NavLinks from "./NavLinks";
import SessionMenu from "./auth/SessionMenu";

export default async function Nav() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-black/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
            CL
          </span>
          <span>{company.nameKo}</span>
        </Link>

        <NavLinks session={session} />
      </div>
    </header>
  );
}

export { SessionMenu };
