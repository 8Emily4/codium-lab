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

export default function PWARegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const pathname = usePathname()
  const lang = pathname?.split('/')[1] ?? 'ko'
  const installLabel = installLabels[lang] ?? installLabels.ko

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('[SW] registration failed:', err))
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
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

  if (!installEvent || installed) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:bottom-6">
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
    </div>
  )
}
