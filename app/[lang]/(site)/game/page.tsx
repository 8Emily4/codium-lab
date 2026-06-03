import type { Metadata } from "next";
import GameHub from "@/components/game/GameHub";
import { getDictionary, hasLocale } from "../../dictionaries";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.game.metaTitle,
    description: dict.game.metaDesc,
  };
}

export default async function GamePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <GameHub dict={dict.game} lang={lang} />;
}
