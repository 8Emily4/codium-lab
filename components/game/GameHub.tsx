'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { Dictionary } from '@/app/[lang]/dictionaries'

const SnakeGame = dynamic<{ onClose: () => void; strings: GameDict['snake'] }>(
  () => import('./SnakeGame'), { ssr: false }
)
const AirplaneGame = dynamic<{ onClose: () => void; strings: GameDict['airplane'] }>(
  () => import('./AirplaneGame'), { ssr: false }
)
const BubbleShooterGame = dynamic<{ onClose: () => void; strings: GameDict['bubble'] }>(
  () => import('./BubbleShooterGame'), { ssr: false }
)
const DefenseGame = dynamic<{ onClose: () => void }>(
  () => import('./DefenseGame'), { ssr: false }
)

type GameId = 'snake' | 'airplane' | 'bubble' | 'defense'
type GameDict = Dictionary['game']

interface GameMeta {
  id: GameId
  title: string
  subtitle: string
  description: string
  tags: readonly string[]
  controls: readonly string[]
  appLinks: {
    label: string
    url: string
    icon: React.ReactNode
    available: boolean
  }[]
  gradient: string
  accentColor: string
  emoji: string
  players: string
  difficulty: string
}

const APP_LINKS_ICONS = {
  appStore: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  ),
  googlePlay: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
    </svg>
  ),
}

function buildGames(dict: GameDict): GameMeta[] {
  const appLinks = [
    { label: 'App Store', url: '#', available: false, icon: APP_LINKS_ICONS.appStore },
    { label: 'Google Play', url: '#', available: false, icon: APP_LINKS_ICONS.googlePlay },
  ]
  return [
    {
      id: 'snake',
      title: 'Snake Grow Battle',
      subtitle: dict.snake.subtitle,
      description: dict.snake.description,
      tags: dict.snake.tags,
      controls: dict.snake.controls,
      appLinks,
      gradient: 'from-indigo-600 via-violet-600 to-fuchsia-600',
      accentColor: '#6366f1',
      emoji: '🐍',
      players: dict.snake.players,
      difficulty: dict.snake.difficulty,
    },
    {
      id: 'airplane',
      title: 'Airplane Battle Royale',
      subtitle: dict.airplane.subtitle,
      description: dict.airplane.description,
      tags: dict.airplane.tags,
      controls: dict.airplane.controls,
      appLinks,
      gradient: 'from-sky-600 via-blue-600 to-indigo-700',
      accentColor: '#3b82f6',
      emoji: '✈️',
      players: dict.airplane.players,
      difficulty: dict.airplane.difficulty,
    },
    {
      id: 'bubble' as GameId,
      title: 'Bubble Shooter',
      subtitle: dict.bubble.subtitle,
      description: dict.bubble.description,
      tags: dict.bubble.tags,
      controls: dict.bubble.controls,
      appLinks,
      gradient: 'from-purple-600 via-pink-600 to-rose-500',
      accentColor: '#d946ef',
      emoji: '🫧',
      players: dict.bubble.players,
      difficulty: dict.bubble.difficulty,
    },
    {
      id: 'defense' as GameId,
      title: 'Island Defense',
      subtitle: (dict as any).defense?.subtitle ?? 'Tower Defense',
      description: (dict as any).defense?.description ?? 'Summon and merge snake towers to defend the island.',
      tags: (dict as any).defense?.tags ?? ['타워디펜스', '전략', '가챠'],
      controls: (dict as any).defense?.controls ?? ['드래그 → 이동/합성', '소환 버튼 → 가챠 소환', 'ESC → 나가기'],
      appLinks,
      gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
      accentColor: '#10b981',
      emoji: '🏰',
      players: (dict as any).defense?.players ?? '1인',
      difficulty: (dict as any).defense?.difficulty ?? '보통',
    },
  ]
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-zinc-200/60 bg-white/60 px-4 py-2.5 dark:border-zinc-800/60 dark:bg-zinc-900/60">
      <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">{label}</span>
      <span className="mt-0.5 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{value}</span>
    </div>
  )
}

function AppBadge({ link, notAvailableLabel }: { link: GameMeta['appLinks'][number]; notAvailableLabel: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
        link.available
          ? 'cursor-pointer border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'
          : 'cursor-not-allowed border-zinc-200/50 bg-zinc-50/50 text-zinc-400 dark:border-zinc-800/50 dark:bg-zinc-900/30 dark:text-zinc-600'
      }`}
    >
      {link.icon}
      <span>{link.label}</span>
      {!link.available && (
        <span className="ml-1 rounded-full bg-zinc-200/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
          {notAvailableLabel}
        </span>
      )}
    </div>
  )
}

function GameCard({
  game,
  dict,
  onPlay,
}: {
  game: GameMeta
  dict: GameDict
  onPlay: () => void
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white shadow-sm transition-all hover:shadow-xl dark:border-zinc-800/70 dark:bg-zinc-950">
      <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${game.gradient}`}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="select-none text-8xl opacity-90 drop-shadow-xl transition-transform group-hover:scale-110">
            {game.emoji}
          </span>
        </div>
        <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
          {game.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-black/30 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{game.title}</h2>
            <p className="text-sm text-zinc-500">{game.subtitle}</p>
          </div>
          <button
            onClick={onPlay}
            className={`shrink-0 rounded-full bg-gradient-to-r ${game.gradient} px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 hover:shadow-lg active:scale-95`}
          >
            {dict.playButton}
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {game.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <StatBadge label={dict.playersLabel} value={game.players} />
          <StatBadge label={dict.difficultyLabel} value={game.difficulty} />
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{dict.controlsLabel}</p>
          <ul className="mt-2 space-y-1">
            {game.controls.map((ctrl) => (
              <li key={ctrl} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                {ctrl}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{dict.downloadLabel}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {game.appLinks.map((link) => (
              <AppBadge key={link.label} link={link} notAvailableLabel={dict.notAvailableBadge} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ComingSoonCard({ title, emoji, desc, gradient, comingSoonLabel }: { title: string; emoji: string; desc: string; gradient: string; comingSoonLabel: string }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} opacity-50`}>
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
        <span className="text-5xl">{emoji}</span>
        <p className="mt-1 font-semibold text-white/80">{title}</p>
        <p className="text-sm text-white/60">{desc}</p>
        <span className="mt-2 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-white/70">
          {comingSoonLabel}
        </span>
      </div>
    </div>
  )
}

function GameModal({ gameId, dict, onClose }: { gameId: GameId; dict: GameDict; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-[calc(100vh-32px)] w-[calc(100vw-32px)] max-w-7xl overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl sm:h-[calc(100vh-48px)] sm:w-[calc(100vw-48px)]">
        {gameId === 'snake' && <SnakeGame onClose={onClose} strings={dict.snake} />}
        {gameId === 'airplane' && <AirplaneGame onClose={onClose} strings={dict.airplane} />}
        {gameId === 'bubble' && <BubbleShooterGame onClose={onClose} strings={dict.bubble} />}
        {gameId === 'defense' && <DefenseGame onClose={onClose} />}
      </div>
    </div>
  )
}

export default function GameHub({ dict, lang }: { dict: GameDict; lang: string }) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null)
  const GAMES = buildGames(dict)

  return (
    <>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            {dict.hubBadge}
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            {dict.hubHeading}
          </h1>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
            {dict.hubDesc}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-1">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} dict={dict} onPlay={() => setActiveGame(game.id)} />
          ))}
        </div>

        {dict.comingSoonGames.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-400">
              {dict.comingSoonLabel}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {dict.comingSoonGames.map((g) => (
                <ComingSoonCard key={g.title} title={g.title} emoji={g.emoji} desc={g.desc} gradient={g.title === 'Pixel Dungeon' ? 'from-amber-600 to-orange-700' : 'from-emerald-600 to-teal-700'} comingSoonLabel="Coming Soon" />
              ))}
            </div>
          </div>
        )}

        <p className="mt-16 text-center text-sm text-zinc-400">
          {dict.feedbackText}{' '}
          <a href={`/${lang}/contact`} className="font-medium text-indigo-500 underline-offset-4 hover:underline">
            {dict.contactLink}
          </a>
        </p>
      </section>

      {activeGame && (
        <GameModal gameId={activeGame} dict={dict} onClose={() => setActiveGame(null)} />
      )}
    </>
  )
}
