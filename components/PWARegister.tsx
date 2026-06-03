'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWARegister({ installLabel = "앱으로 설치하기" }: { installLabel?: string }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('[SW] registration failed:', err))
    }

    // 이미 설치됐는지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    // 설치 프롬프트 이벤트 저장
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // 설치 완료 감지
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

  // 설치 버튼 (beforeinstallprompt가 있을 때만 표시)
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
