import type { MetadataRoute } from 'next';

/**
 * Web App Manifest — https://www.koramp.xyz/manifest.webmanifest
 * Meningkatkan PWA score dan sinyal SEO (Google mengindeks manifest).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KORAMP — Crypto On/Off-Ramp',
    short_name: 'KORAMP',
    description:
      'Beli SOL, ETH, BNB dengan Rupiah atau jual crypto dan terima IDR ke rekening bank. Tanpa daftar akun.',
    start_url: '/',
    display: 'standalone',
    background_color: '#08080A',
    theme_color: '#D4B78F',
    orientation: 'portrait-primary',
    lang: 'id',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['finance', 'utilities'],
    shortcuts: [
      {
        name: 'Top Up Crypto',
        short_name: 'Top Up',
        description: 'Beli SOL, ETH, atau BNB dengan Rupiah',
        url: '/topup-sell',
        icons: [{ src: '/logo.png', sizes: '96x96' }],
      },
      {
        name: 'Lihat Transaksi',
        short_name: 'Transaksi',
        description: 'Lihat riwayat transaksi KORAMP',
        url: '/transactions',
        icons: [{ src: '/logo.png', sizes: '96x96' }],
      },
    ],
  };
}
