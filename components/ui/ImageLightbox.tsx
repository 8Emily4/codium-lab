'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

type GalleryImage = { src: string; alt?: string }

type Props = {
  images: GalleryImage[]
  initialIndex?: number
  onClose: () => void
}

export function ImageLightbox({ images, initialIndex = 0, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex)

  const prev = () => setCurrent(i => Math.max(0, i - 1))
  const next = () => setCurrent(i => Math.min(images.length - 1, i + 1))

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
  }, [onClose]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  const img = images[current]

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white/80 transition hover:bg-black/70 hover:text-white"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white/80">
          {current + 1} / {images.length}
        </div>
      )}

      {current > 0 && (
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition hover:bg-black/70 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      {current < images.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); next() }}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition hover:bg-black/70 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      <img
        src={img.src}
        alt={img.alt ?? ''}
        className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
        onClick={e => e.stopPropagation()}
      />

      {img.alt && (
        <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-black/50 px-4 py-1.5 text-sm text-white/80">
          {img.alt}
        </div>
      )}
    </div>,
    document.body
  )
}
