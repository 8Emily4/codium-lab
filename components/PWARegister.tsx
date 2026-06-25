'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const installLabels: Record<string, string> = {
  ko: '앱으로 설치하기',
  en: 'Install app',
}
const dismissLabels: Record<string, string> = {
  ko: '오늘 안 보기',
  en: 'Not today',
}

// "오늘 안 보기"를 누르면 그날 날짜를 저장하고, 같은 날에는 배너를 띄우지 않는다.
const DISMISS_KEY = 'pwa-install-dismissed'
const todayKey = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD (로컬 기준)

export default function PWARegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const pathname = usePathname()
  const lang = pathname?.split('/')[1] ?? 'ko'
  const installLabel = installLabels[lang] ?? installLabels.ko
  const dismissLabel = dismissLabels[lang] ?? dismissLabels.ko

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .catch((err) => console.warn('[SW] registration failed:', err))
      } else {
        // Dev: a previously-registered SW serves stale /_next/static chunks
        // cache-first, breaking the layout after each hot reload. Tear it down.
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => regs.forEach((r) => r.unregister()))
          .catch(() => {})
        caches?.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {})
      }
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    // 오늘 이미 "오늘 안 보기"를 눌렀으면 배너를 숨긴다.
    try {
      if (localStorage.getItem(DISMISS_KEY) === todayKey()) {
        setDismissed(true)
      }
    } catch {
      /* localStorage 접근 불가(프라이빗 모드 등) — 무시 */
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setInstallEvent(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setInstallEvent(null)
    }
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, todayKey())
    } catch {
      /* 저장 실패해도 이번 세션 동안은 숨긴다 */
    }
    setDismissed(true)
  }

  if (!installEvent || installed || dismissed) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 sm:bottom-6">
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500 active:scale-95"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 2v13M7 11l5 5 5-5" />
          <rect x="2" y="17" width="20" height="4" rx="2" />
        </svg>
        {installLabel}
      </button>
      <button
        onClick={handleDismiss}
        className="rounded-full border border-zinc-300/70 bg-white/90 px-3 py-3 text-xs font-medium text-zinc-600 shadow-lg backdrop-blur transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {dismissLabel}
      </button>
    </div>
  )
}
