import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '코디움랩 | Codium Lab',
    short_name: '코디움랩',
    description: '기술의 본질을 연구하고 가치를 구현하는 프리미엄 IT 솔루션 연구소',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#050507',
    theme_color: '#6366f1',
    lang: 'ko',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/app-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/app-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/app-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/app-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/og-image.png',
        sizes: '1200x630',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
  }
}
