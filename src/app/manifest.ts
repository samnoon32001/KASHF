import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kashf Institute of Islamic Excellence',
    short_name: 'Kashf',
    description: 'LMS & institutional management progressive web application for Kashf Institute of Islamic Excellence',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#117B78',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
