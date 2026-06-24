'use client'

import { useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { ImageLightbox } from '@/components/ui/ImageLightbox'
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
  gradient: string
  accentColor: string
  emoji: string
  players: string
  difficulty: string
}

interface AppPromo {
  emoji: string
  name: string
  bundleId: string
  gradient: string
  screenshots: string[]
  stores: {
    label: string
    icon: React.ReactNode
    url: string
    available: boolean
  }[]
}

const STORE_ICONS = {
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

// 출시 예정 앱 목록 — URL/available 플래그만 업데이트하면 스토어 링크 활성화됨
const APP_PROMOS: AppPromo[] = [
  {
    emoji: '🐍',
    name: 'Snake Arena: Grow & Battle',
    bundleId: 'com.snakegrow.battle',
    gradient: 'from-indigo-600 via-violet-600 to-fuchsia-600',
    screenshots: [
      '/games/snake-arena/screen-1.png',
      '/games/snake-arena/screen-2.png',
      '/games/snake-arena/screen-3.png',
      '/games/snake-arena/screen-4.png',
      '/games/snake-arena/screen-5.png',
      '/games/snake-arena/screen-6.png',
      '/games/snake-arena/screen-7.png',
    ],
    stores: [
      { label: 'App Store', icon: STORE_ICONS.appStore, url: '#', available: false },
      { label: 'Google Play', icon: STORE_ICONS.googlePlay, url: 'https://play.google.com/store/apps/details?id=com.snakegrow.battle', available: true },
    ],
  },
]

function buildGames(dict: GameDict, lang: string): GameMeta[] {
  const isEn = lang === 'en'
  return [
    {
      id: 'snake',
      title: 'Snake Grow Battle',
      subtitle: dict.snake.subtitle,
      description: dict.snake.description,
      tags: dict.snake.tags,
      controls: dict.snake.controls,
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
      tags: (dict as any).defense?.tags ?? (isEn ? ['Tower Defense', 'Strategy', 'Gacha'] : ['타워디펜스', '전략', '가챠']),
      controls: (dict as any).defense?.controls ?? (isEn ? ['Drag → move/merge', 'Summon button → gacha summon', 'ESC → exit'] : ['드래그 → 이동/합성', '소환 버튼 → 가챠 소환', 'ESC → 나가기']),
      gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
      accentColor: '#10b981',
      emoji: '🏰',
      players: (dict as any).defense?.players ?? (isEn ? '1 player' : '1인'),
      difficulty: (dict as any).defense?.difficulty ?? (isEn ? 'Normal' : '보통'),
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

function AppPromoCard({ app, dict, lang }: { app: AppPromo; dict: GameDict; lang: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const galleryImages = app.screenshots.map((src, i) => ({
    src,
    alt: `${app.name} screenshot ${i + 1}`,
  }))

  return (
    <>
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${app.gradient} p-px`}>
        <div className="rounded-[15px] bg-zinc-950/90 backdrop-blur-sm">
          {/* 앱 정보 + 다운로드 버튼 */}
          <div className="flex flex-col gap-4 px-6 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${app.gradient} text-3xl shadow-lg`}>
                {app.emoji}
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500">{app.bundleId}</p>
                <h3 className="text-lg font-bold text-white">{app.name}</h3>
                <p className="mt-0.5 text-sm text-zinc-400">{dict.appBannerDesc}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:shrink-0">
              {app.stores.map((store) =>
                store.available ? (
                  <a
                    key={store.label}
                    href={store.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    {store.icon}
                    {store.label}
                  </a>
                ) : (
                  <div
                    key={store.label}
                    className="flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-2.5 text-sm font-medium text-zinc-500"
                  >
                    {store.icon}
                    {store.label}
                    <span className="rounded-full bg-zinc-700/80 px-2 py-0.5 text-[10px] font-semibold">
                      {dict.notAvailableBadge}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* 스크린샷 썸네일 */}
          {app.screenshots.length > 0 && (
            <div className="mt-4 overflow-x-auto pb-5 pl-6 pr-6 scrollbar-none">
              <div className="flex gap-2" style={{ width: 'max-content' }}>
                {app.screenshots.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className="relative h-[88px] w-[42px] shrink-0 overflow-hidden rounded-lg border border-white/10 transition hover:border-white/30 hover:brightness-110 focus:outline-none"
                  >
                    <Image
                      src={src}
                      alt={`${app.name} screenshot ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="42px"
                    />
                  </button>
                ))}
                <button
                  onClick={() => setLightboxIndex(0)}
                  className="flex h-[88px] w-[42px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-white/10 text-zinc-500 transition hover:border-white/30 hover:text-zinc-300"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                  <span className="text-[9px] font-medium">{lang === 'en' ? 'All' : '전체'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={galleryImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
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
  const GAMES = buildGames(dict, lang)

  return (
    <>
      <section className="relative border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">

          {APP_PROMOS.length > 0 && (
            <div className="mb-12 space-y-4">
              {APP_PROMOS.map((app) => (
                <AppPromoCard key={app.bundleId} app={app} dict={dict} lang={lang} />
              ))}
              <p className="text-center text-xs text-zinc-500">
                {dict.appBannerWebNote}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {GAMES.map((game) => (
              <GameCard key={game.id} game={game} dict={dict} onPlay={() => setActiveGame(game.id)} />
            ))}
          </div>

          {dict.comingSoonGames.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-zinc-400">
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
        </div>
      </section>

      {activeGame && (
        <GameModal gameId={activeGame} dict={dict} onClose={() => setActiveGame(null)} />
      )}
    </>
  )
}
